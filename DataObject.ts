import {
  AdditionalDataRegistry,
  instance as additionalDataRegistryInstance,
} from './AdditionalDataRegistry';
import AdditionalData from './AdditionalData';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';

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

export interface IDataObject {
  addKey(...keys: (keyof this)[]): void;
  keys(): (keyof this)[];
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

    if (current === Number.MAX_SAFE_INTEGER) {
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
  #id: string;
  #keys: (keyof this)[] = ['id'];

  constructor() {
    this.#id = idProvider(this);
  }

  addKey(...keys: (keyof this)[]): void {
    this.#keys.push(...keys);
  }

  id(): string {
    return this.#id;
  }

  keys(): (keyof this)[] {
    return this.#keys;
  }

  sourceClass(): IConstructor<this> {
    return this.constructor as IConstructor<this>;
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
