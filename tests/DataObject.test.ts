import AdditionalData from '../AdditionalData';
import AdditionalDataRegistry from '../AdditionalDataRegistry';
import DataObject from '../DataObject';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { expect } from 'chai';
import reconstituteData from '../lib/reconstituteData';

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
      plainA = reconstituteData(a.toPlainObject());

    expect(plainA).to.a('object').keys('_', 'id', 'a', 'c');
    expect(plainA._).to.equal('A');
    expect(plainA.a).to.equal('a');
    expect(plainA.c).to.equal('c');
  });

  it('should return nested DataObjects', (): void => {
    const b = new B(new A(), new A(), new A()),
      plainB = reconstituteData(b.toPlainObject());

    expect(plainB).to.a('object').keys('_', 'id', 'a', 'b');
    expect(plainB.a).to.a('object').keys('_', 'id', 'a', 'c');
    expect(plainB.b).to.a('array').lengthOf(2);
    expect(plainB.b[0]).to.a('object').keys('_', 'id', 'a', 'c');
    expect(plainB.b[1]).to.a('object').keys('_', 'id', 'a', 'c');
  });

  it('should return entries from Registries', (): void => {
    const aRegistry = new ARegistry(),
      c = new C(aRegistry),
      plainC = reconstituteData(c.toPlainObject());

    expect(plainC).to.a('object').keys('_', 'id', 'a');
    expect(plainC.a).to.a('array').lengthOf(0);

    aRegistry.register(new A(), new A(), new A());

    expect(aRegistry.entries().length).to.equal(3);
    expect(aRegistry.length).to.equal(3);

    const updatedPlainC = reconstituteData(c.toPlainObject());

    expect(updatedPlainC.a).to.a('array').lengthOf(3);
    expect(updatedPlainC.a[0]).to.a('object').keys('_', 'id', 'a', 'c');
    expect(updatedPlainC.a[1]).to.a('object').keys('_', 'id', 'a', 'c');
    expect(updatedPlainC.a[2]).to.a('object').keys('_', 'id', 'a', 'c');
  });

  it('should return values from getters', (): void => {
    const d = new D(new A()),
      plainD = reconstituteData(d.toPlainObject());

    expect(plainD).to.a('object').keys('_', 'id', 'a');
    expect(plainD.a).to.a('object').keys('_', 'id', 'a', 'c');
  });

  it('should return function name only from raw functions', (): void => {
    const e = new E(),
      plainE = reconstituteData(e.toPlainObject());

    expect(plainE).to.a('object').keys('_', 'id', 'a');
    expect(plainE.a).to.a('object').keys('_');
    expect(plainE.a._).to.equal('A');
  });

  it('should return correctly handle nested objects', (): void => {
    const f = new F(),
      plainF = reconstituteData(f.toPlainObject());

    expect(plainF).to.a('object').keys('_', 'id', 'a');
    expect(plainF.a).to.a('object').keys('a', 'b', 'c', 'd', 'e');
    expect(plainF.a.a).to.true;
    expect(plainF.a.b).to.equal(2);
    expect(plainF.a.c).to.equal('C');
    expect(plainF.a.d).to.a('object').keys('_');
    expect(plainF.a.d._).to.equal('D');
    expect(plainF.a.e).to.a('object').keys('a');
    expect(plainF.a.e.a).to.a('object').keys('_', 'id', 'a', 'c');
  });

  class World extends DataObject {
    #tiles = new EntityRegistry(Tile);

    constructor() {
      super();

      this.addKey('tiles');
    }

    tiles(): EntityRegistry {
      return this.#tiles;
    }
  }

  class Tile extends DataObject {}

  class Unit extends DataObject {
    #tile: Tile;

    constructor(tile: Tile) {
      super();

      this.#tile = tile;

      this.addKey('tile');
    }

    tile(): Tile {
      return this.#tile;
    }
  }

  class City extends DataObject {
    #tile: Tile;

    constructor(tile: Tile) {
      super();

      this.#tile = tile;

      this.addKey('tile');
    }

    tile(): Tile {
      return this.#tile;
    }
  }

  it('should provide a hierarchy and map of objects that allows nesting and recursion', (): void => {
    const additionalDataRegistry = new AdditionalDataRegistry(),
      cityRegistry = new EntityRegistry(City),
      unitRegistry = new EntityRegistry(Unit),
      world = new World();

    additionalDataRegistry.register(
      new AdditionalData(Tile, 'units', (tile: Tile) =>
        unitRegistry.getBy('tile', tile)
      )
    );
    additionalDataRegistry.register(
      new AdditionalData(
        Tile,
        'city',
        (tile: Tile) => cityRegistry.getBy('tile', tile)[0]
      )
    );

    const tile1 = new Tile(),
      tile2 = new Tile(),
      tile3 = new Tile(),
      tile4 = new Tile(),
      tile5 = new Tile();

    world.tiles().register(tile1, tile2, tile3, tile4, tile5);

    const unit1 = new Unit(tile1),
      unit2 = new Unit(tile4),
      unit3 = new Unit(tile4),
      unit4 = new Unit(tile4);

    unitRegistry.register(unit1, unit2, unit3, unit4);

    const city1 = new City(tile2),
      city2 = new City(tile4);

    cityRegistry.register(city1, city2);

    const plainWorld = world.toPlainObject(additionalDataRegistry);

    expect(Object.keys(plainWorld.objects).length).equal(12);

    const reconstitutedWorld = reconstituteData(plainWorld);

    expect(reconstitutedWorld).an('object').keys('_', 'id', 'tiles');
    expect(reconstitutedWorld.tiles).an('array').length(5);
    expect(reconstitutedWorld.tiles[3])
      .an('object')
      .keys('_', 'id', 'units', 'city');
    expect(reconstitutedWorld.tiles[3]).equal(
      reconstitutedWorld.tiles[3].units[0].tile
    );
    expect(reconstitutedWorld.tiles[3].units[0]).equal(
      reconstitutedWorld.tiles[3].units[0].tile.units[0].tile.units[0]
    );
  });
});
