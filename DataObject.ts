import {
  AdditionalDataRegistry,
  instance as additionalDataRegistryInstance,
} from './AdditionalDataRegistry';
import AdditionalData from './AdditionalData';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import generateInheritance from './lib/generateInheritance';

export type DataObjectFilter = (object: DataObject) => any;

export type PlainObject = {
  [key: string | symbol | number]: any;
};

export type ObjectStore = {
  [key: string]: PlainObject;
};

export type ObjectMap = {
  hierarchy: PlainObject;
  objects: ObjectStore;
};

/**
 * `IConstructor<T>` must stay assignable to `typeof T`.
 *
 * `ConstructorRegistry<T>` hands out `IConstructor<T>`, and the codebase
 * annotates the classes it gets back as `typeof X` —
 * `core-science/PlayerResearch.available()` and
 * `core-government/PlayerGovernment.available()` both do. `IConstructor` is
 * `new (...args: any[]) => T` and carries no statics, so it satisfies
 * `typeof X` only while `X` declares no *required* static.
 *
 * 0.1.14 declared `static readonly transient: readonly string[]` and broke
 * that, which is why it is optional. Nothing failed in this package — its own
 * tests pass either way — and 22 of the 83 checkouts stopped typechecking,
 * from those two call sites. Hence a compile-time assertion rather than a test:
 * the damage was never visible from in here.
 */
type Assert<T extends true> = T;

type ConstructorStaysAssignable = Assert<
  IConstructor<DataObject> extends typeof DataObject ? true : false
>;

export interface IDataObject {
  addKey(...keys: (string | number | symbol)[]): void;
  allTransient(): readonly string[];
  id(): string;
  stateKeys(): string[];
  keys(): (string | number | symbol)[];
  sourceClass(): IConstructor<this>;
  toPlainObject(): PlainObject;
}

const idCache: { [key: string]: number | bigint } = {},
  idProvider = (object: DataObject) => {
    const className = object.sourceClass().name,
      current = idCache[className];

    if (!current) {
      idCache[className] = 0;
    }

    if (current >= Number.MAX_SAFE_INTEGER) {
      idCache[className] = BigInt(current);
    }

    return className + '-' + (++idCache[className]).toString(36);
  },
  toPlainObject = (
    value: any,
    objects: ObjectStore,
    filter: (object: any) => any = (object) => object,
    additionalDataRegistry: AdditionalDataRegistry = additionalDataRegistryInstance
  ): PlainObject | PlainObject[] => {
    value = filter(value);

    if (value instanceof EntityRegistry) {
      value = value.entries();
    }

    if (Array.isArray(value)) {
      return value.map(
        (item: any): PlainObject =>
          toPlainObject(item, objects, filter, additionalDataRegistry)
      );
    }

    if (value instanceof DataObject) {
      const id = value.id();

      if (!(id in objects)) {
        const plainObject: PlainObject = {
          _: value.sourceClass().name,
          __: generateInheritance(value),
        };

        objects[id] = plainObject;

        value.keys().forEach((key: string): void => {
          const keyValue: any =
            value[key] instanceof Function
              ? (value[key] as unknown as Function)()
              : value[key];

          plainObject[key] = toPlainObject(
            keyValue,
            objects,
            filter,
            additionalDataRegistry
          );
        });

        additionalDataRegistry
          .getByType(value.sourceClass())
          .forEach((additionalData: AdditionalData): void => {
            plainObject[additionalData.key()] = toPlainObject(
              additionalData.data(value),
              objects,
              filter,
              additionalDataRegistry
            );
          });
      }

      return {
        '#ref': id,
      };
    }

    if (value instanceof Function) {
      return {
        _: value.name,
        __: generateInheritance(value),
      };
    }

    if (value && value instanceof Object) {
      return Object.entries(value).reduce(
        (object: PlainObject, [key, value]) => {
          object[key] = toPlainObject(
            value,
            objects,
            filter,
            additionalDataRegistry
          );

          return object;
        },
        {}
      );
    }

    return value;
  };

export class DataObject implements IDataObject {
  /**
   * Field names this class does not want saved.
   *
   * **Opt-out, not opt-in.** A field added later is saved by default, so
   * forgetting to declare it wastes bytes; the reverse would lose data
   * silently, and a save format that quietly drops a new field is worse than
   * one that carries a few it did not need.
   *
   * What belongs here is anything the loading game supplies rather than the
   * file: registries, the engine, the generator. Since every constructor in
   * the engine already takes those as parameters, and a `Game` holds them, a
   * transient field is not a hole in the save — it is a field with a different
   * source.
   *
   * Caches belong here too, for a different reason: they are derived, so
   * restoring them would restore a stale answer.
   */
  static readonly transient?: readonly string[] = ['_id', '_keys'];

  private _id: string;
  private _keys: (keyof this)[] = ['id'];

  constructor() {
    this._id = idProvider(this);
  }

  addKey(...keys: (keyof this)[]): void {
    this._keys.push(...keys);
  }

  id(): string {
    return this._id;
  }

  keys(): (keyof this)[] {
    return this._keys;
  }

  sourceClass<T extends NewableFunction>(): T {
    return this.constructor as T;
  }

  /**
   * Every transient name for this class, including those its ancestors declare.
   *
   * `static` members are inherited, so a subclass declaring its own `transient`
   * *replaces* the parent's rather than adding to it — which would silently
   * start saving `_id` and `_keys` again. Walking the prototype chain is what
   * makes the declarations additive.
   */
  allTransient(): readonly string[] {
    const names = new Set<string>();

    let current: unknown = this.constructor;

    while (typeof current === 'function' && current !== Function.prototype) {
      const declared = (current as { transient?: readonly string[] }).transient;

      if (Array.isArray(declared)) {
        declared.forEach((name) => names.add(name));
      }

      current = Object.getPrototypeOf(current);
    }

    return [...names].sort();
  }

  /**
   * The field names that *would* be saved: own enumerable properties, minus
   * everything transient.
   *
   * This is the whole reason the `#private` → `private` migration happened.
   * With `#private` fields there was nothing to enumerate, so no generic
   * serialiser was possible at all.
   */
  stateKeys(): string[] {
    const transient = new Set(this.allTransient());

    return Object.keys(this)
      .filter((name) => !transient.has(name))
      .sort();
  }

  toPlainObject(
    dataObjectFilter: DataObjectFilter = (object) => object,
    additionalDataRegistry: AdditionalDataRegistry = additionalDataRegistryInstance
  ): ObjectMap {
    const objects = {};

    return {
      hierarchy: toPlainObject(
        this,
        objects,
        dataObjectFilter,
        additionalDataRegistry
      ),
      objects,
    };
  }
}

export default DataObject;
