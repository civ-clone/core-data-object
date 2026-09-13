import {
  ClassRegistry,
  DuplicateTypeError,
  MangledNameError,
} from '../ClassRegistry';
import {
  DataObject,
  idCounters,
  restoreIdCounters,
  typeNameOf,
} from '../DataObject';
import { expect } from 'chai';

class Widget extends DataObject {}

class Tagged extends DataObject {
  static readonly type = 'SomethingElse';
}

describe('typeNameOf', (): void => {
  it('should use the class name when no tag is declared', (): void => {
    expect(typeNameOf(Widget)).to.equal('Widget');
  });

  it('should prefer an explicit tag', (): void => {
    expect(typeNameOf(Tagged)).to.equal('SomethingElse');
  });

  it('should not inherit an ancestor`s tag', (): void => {
    // A subclass of a tagged class must get its own name, or every descendant
    // saves and loads as its parent — one entity type swallowing a hierarchy.
    class Child extends Tagged {}

    expect(typeNameOf(Child)).to.equal('Child');
  });
});

describe('ClassRegistry', (): void => {
  it('should look a class up by its name', (): void => {
    const registry = new ClassRegistry();

    registry.register(Widget);

    expect(registry.get('Widget')).to.equal(Widget);
  });

  it('should look a tagged class up by its tag, and not by its name', (): void => {
    const registry = new ClassRegistry();

    registry.register(Tagged);

    expect(registry.get('SomethingElse')).to.equal(Tagged);
    expect(registry.get('Tagged')).to.be.null;
  });

  it('should return null for an unknown name rather than undefined', (): void => {
    expect(new ClassRegistry().get('Nonexistent')).to.be.null;
  });

  it('should accept the same class twice', (): void => {
    // Plugin imports are not ordered and a package may be reached twice; a
    // second registration of the *same* class is not a conflict.
    const registry = new ClassRegistry();

    registry.register(Widget);

    expect(() => registry.register(Widget)).not.to.throw();
    expect(registry.length).to.equal(1);
  });

  it('should refuse two different classes claiming one name', (): void => {
    // Whichever registered last would win, and a save recording that name
    // would hydrate into the wrong class with no error.
    const registry = new ClassRegistry();
    const other = class Widget extends DataObject {};

    registry.register(Widget);

    expect(() => registry.register(other)).to.throw(DuplicateTypeError);
  });

  it('should refuse a name short enough to be a minifier artefact', (): void => {
    // The failure this exists for: `keepNames: false` turns every class into
    // `t`, `n`, `e`, and saves written then are unreadable by any other build.
    // Refusing at registration turns that into a startup error.
    const registry = new ClassRegistry();

    expect(() => registry.register(class t extends DataObject {})).to.throw(
      MangledNameError
    );
  });

  it('should accept the shortest real class name in the engine', (): void => {
    // `Or`, two characters, is the shortest name any exported class has. The
    // guard must not reject it, or the check is a liability rather than a
    // safeguard.
    const registry = new ClassRegistry();

    expect(() =>
      registry.register(class Or extends DataObject {})
    ).not.to.throw();
  });

  it('should take every class from a constructor registry', (): void => {
    const registry = new ClassRegistry();

    registry.registerFrom({ entries: () => [Widget, Tagged] });

    expect(registry.names()).to.deep.equal(['SomethingElse', 'Widget']);
  });

  it('should ignore non-classes a registry hands it', (): void => {
    // `ConstructorRegistry` is typed to hold constructors but `EntityRegistry`
    // subclasses share the interface, so a mixed registry is possible.
    const registry = new ClassRegistry();

    registry.registerFrom({ entries: () => [Widget, new Widget(), 'nope'] });

    expect(registry.names()).to.deep.equal(['Widget']);
  });
});

describe('id counters', (): void => {
  it('should report a counter per class', (): void => {
    new Widget();

    expect(idCounters()).to.have.property('Widget');
  });

  it('should count under the tag, not the class name', (): void => {
    // Ids are `<type>-<counter>`, so the counter has to be keyed the same way
    // or a restored counter is filed against a name no id ever uses.
    new Tagged();

    expect(idCounters()).to.have.property('SomethingElse');
    expect(new Tagged().id()).to.match(/^SomethingElse-/);
  });

  it('should return a copy', (): void => {
    const counters = idCounters();
    const before = counters.Widget;

    counters.Widget = 9999;

    expect(idCounters().Widget).to.equal(before);
  });

  it('should restore a counter so later ids do not collide', (): void => {
    class Restored extends DataObject {}

    restoreIdCounters({ Restored: 40 });

    expect(new Restored().id()).to.equal(`Restored-${(41).toString(36)}`);
  });

  it('should only ever move a counter forward', (): void => {
    // Plugin imports create entities — terrain definitions, civilisations,
    // leaders — *before* a save is loaded. Lowering a counter to the saved
    // value would hand out ids those definitions already hold.
    class Advanced extends DataObject {}

    restoreIdCounters({ Advanced: 100 });
    restoreIdCounters({ Advanced: 5 });

    expect(new Advanced().id()).to.equal(`Advanced-${(101).toString(36)}`);
  });
});
