import { DataObject, typeNameOf } from './DataObject';

/**
 * What hydration needs of a class, and no more.
 *
 * `prototype` rather than a constructor signature, deliberately: loading calls
 * `Object.create(Type.prototype)` and never `new Type()`, which is the whole
 * point of the `#private` → `private` migration. Typing this as
 * `IConstructor<DataObject>` would additionally exclude every `abstract` class,
 * and abstract classes are exactly the ones a save never names but a registry
 * may still be handed.
 */
export type SaveableClass = {
  /**
   * `object`, not `DataObject`, and that is a deliberate widening.
   *
   * `DataObject._keys` is typed `(keyof this)[]`, so a subclass that adds any
   * public member is not assignable to the base — `Yield` adds `values()`, and
   * `register(Gold)` from `base-city-yield-gold` failed with
   * `'"values"' is not assignable to 'keyof DataObject'`. The constraint was
   * tighter than the use: all this registry does is read `name` and `type`, and
   * hand `prototype` to `Object.create` for the hydrator to fill.
   *
   * Widening, so every existing caller still compiles.
   */
  prototype: object;
  name: string;
  type?: string;
};

export class DuplicateTypeError extends Error {}
export class MangledNameError extends Error {}

/**
 * Type name → class, for hydration to turn a saved `type` back into something
 * it can allocate.
 *
 * Populated explicitly. The twelve `ConstructorRegistry` instances already hold
 * most of the concrete classes and can be handed over wholesale with
 * `registerFrom`, but entity classes that live nowhere else — `City`, `Unit`,
 * `Tile` — have to be registered by their packages.
 */
export class ClassRegistry {
  private _classes: Map<string, SaveableClass> = new Map();

  /**
   * Register one or more classes under `type` if declared, `name` otherwise.
   *
   * Two refusals, both of which would otherwise surface as a corrupt save
   * rather than as an error:
   *
   * **A name of one character or less.** `02-design-review.md` §7 records that
   * the whole identity scheme rests on `keepNames: true` in `esbuild.js` —
   * drop it and every class becomes `t`, `n`, `e`. Saves would then be written
   * with single-letter types and be unreadable by any other build. An explicit
   * `static type` on all 303 classes is the real fix and is 243 packages of
   * work; refusing the mangled case costs nothing and turns a silent
   * corruption into a startup failure. It cannot false-positive: the shortest
   * real class name in the engine is `Or`, at two characters, and that is a
   * rule combinator rather than a `DataObject`.
   *
   * **A duplicate.** Two classes claiming one name means a save's `type` is
   * ambiguous and hydration would pick whichever registered last. This is also
   * the second line of defence against mangling, since names collide long
   * before all 517 of them are exhausted.
   */
  register(...classes: SaveableClass[]): void {
    classes.forEach((Class) => {
      const name = typeNameOf(Class);

      if (name.length <= 1) {
        throw new MangledNameError(
          `Refusing to register a class as '${name}'. A name this short means ` +
            'the bundle has been minified without `keepNames: true`, and ' +
            'saves written now would be unreadable by any other build. Either ' +
            'restore `keepNames` or give the class an explicit `static type`.'
        );
      }

      const existing = this._classes.get(name);

      if (existing && existing !== Class) {
        throw new DuplicateTypeError(
          `Two classes claim the type '${name}'. A save recording it would be ` +
            'ambiguous, so hydration cannot be allowed to guess. Give one of ' +
            'them an explicit `static type`.'
        );
      }

      this._classes.set(name, Class);
    });
  }

  /**
   * Every class in a `ConstructorRegistry`-shaped registry.
   *
   * Structural rather than an import of `ConstructorRegistry`, so this stays
   * usable from anything holding a list of classes and `core-data-object` does
   * not grow a dependency for one method signature.
   */
  registerFrom(registry: { entries(): unknown[] }): void {
    this.register(
      ...(registry
        .entries()
        .filter(
          (entry) => typeof entry === 'function'
        ) as unknown as SaveableClass[])
    );
  }

  get(name: string): SaveableClass | null {
    return this._classes.get(name) ?? null;
  }

  has(name: string): boolean {
    return this._classes.has(name);
  }

  names(): string[] {
    return [...this._classes.keys()].sort();
  }

  get length(): number {
    return this._classes.size;
  }
}

export const instance = new ClassRegistry();

export default ClassRegistry;
