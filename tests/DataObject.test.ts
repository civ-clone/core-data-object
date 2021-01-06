import DataObject from '../DataObject';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { expect } from 'chai';

class A extends DataObject {
  a: string = 'a';
  b: string = 'b';
  c: string = 'c';

  constructor() {
    super();

    this.addKey('a', 'c');
  }
}

class B extends DataObject {
  a: A;
  b: A[];

  constructor(a: A, ...b: A[]) {
    super();

    this.addKey('a', 'b');

    this.a = a;
    this.b = b;
  }
}

class C extends DataObject {
  a: ARegistry;

  constructor(a: ARegistry) {
    super();

    this.addKey('a');

    this.a = a;
  }
}

class D extends DataObject {
  #a: A;

  constructor(a: A) {
    super();

    this.addKey('a');

    this.#a = a;
  }

  a() {
    return this.#a;
  }
}

class E extends DataObject {
  #a: typeof A = A;

  constructor() {
    super();

    this.addKey('a');
  }

  a() {
    return this.#a;
  }
}

class F extends DataObject {
  a: Object = {
    a: true,
    b: 2,
    c: 'C',
    d: D,
    e: {
      a: new A(),
    },
  };

  constructor() {
    super();

    this.addKey('a');
  }
}

class ARegistry extends EntityRegistry<A> {
  constructor() {
    super(A);
  }
}

describe('DataObject', (): void => {
  it('should return expected keys', (): void => {
    const a = new A(),
      plainA = a.toPlainObject();

    expect(plainA).to.a('object').keys('_', 'a', 'c');
    expect(plainA._).to.equal('A');
    expect(plainA.a).to.equal('a');
    expect(plainA.c).to.equal('c');
  });

  it('should return nested DataObjects', (): void => {
    const b = new B(new A(), new A(), new A()),
      plainB = b.toPlainObject();

    expect(plainB).to.a('object').keys('_', 'a', 'b');
    expect(plainB.a).to.a('object').keys('_', 'a', 'c');
    expect(plainB.b).to.a('array').lengthOf(2);
    expect(plainB.b[0]).to.a('object').keys('_', 'a', 'c');
    expect(plainB.b[1]).to.a('object').keys('_', 'a', 'c');
  });

  it('should return entries from Registries', (): void => {
    const aRegistry = new ARegistry(),
      c = new C(aRegistry),
      plainC = c.toPlainObject();

    expect(plainC).to.a('object').keys('_', 'a');
    expect(plainC.a).to.a('array').lengthOf(0);

    aRegistry.register(new A(), new A(), new A());

    expect(aRegistry.entries().length).to.equal(3);
    expect(aRegistry.length).to.equal(3);

    const updatedPlainC = c.toPlainObject();

    expect(updatedPlainC.a).to.a('array').lengthOf(3);
    expect(updatedPlainC.a[0]).to.a('object').keys('_', 'a', 'c');
    expect(updatedPlainC.a[1]).to.a('object').keys('_', 'a', 'c');
    expect(updatedPlainC.a[2]).to.a('object').keys('_', 'a', 'c');
  });

  it('should return values from getters', (): void => {
    const d = new D(new A()),
      plainD = d.toPlainObject();

    expect(plainD).to.a('object').keys('_', 'a');
    expect(plainD.a).to.a('object').keys('_', 'a', 'c');
  });

  it('should return function name only from raw functions', (): void => {
    const e = new E(),
      plainE = e.toPlainObject();

    expect(plainE).to.a('object').keys('_', 'a');
    expect(plainE.a).to.a('object').keys('_');
    expect(plainE.a._).to.equal('A');
  });

  it('should return correctly handle nested objects', (): void => {
    const f = new F(),
      plainF = f.toPlainObject();

    expect(plainF).to.a('object').keys('_', 'a');
    expect(plainF.a).to.a('object').keys('a', 'b', 'c', 'd', 'e');
    expect(plainF.a.a).to.true;
    expect(plainF.a.b).to.equal(2);
    expect(plainF.a.c).to.equal('C');
    expect(plainF.a.d).to.a('object').keys('_');
    expect(plainF.a.d._).to.equal('D');
    expect(plainF.a.e).to.a('object').keys('a');
    expect(plainF.a.e.a).to.a('object').keys('_', 'a', 'c');
  });
});
