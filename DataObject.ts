import {
  AdditionalDataRegistry,
  instance as additionalDataRegistryInstance,
} from './AdditionalDataRegistry';
import AdditionalData from './AdditionalData';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { ulid } from 'ulid';

export type PlainObject = {
  [key: string]: any;
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
  toPlainObject(): PlainObject;
}

export class DataObject implements IDataObject {
  #id: string;
  #keys: (keyof this)[] = ['id'];
  #toPlainObject = (
    value: any,
    objects: ObjectStore,
    additionalDataRegistry: AdditionalDataRegistry = additionalDataRegistryInstance
  ): PlainObject | PlainObject[] => {
    if (value instanceof EntityRegistry) {
      value = value.entries();
    }

    if (Array.isArray(value)) {
      return value.map(
        (item: any): PlainObject =>
          this.#toPlainObject(item, objects, additionalDataRegistry)
      );
    }

    if (value instanceof DataObject) {
      const id = value.id();

      if (!(id in objects)) {
        const plainObject: PlainObject = {
          _: value.constructor.name,
        };

        objects[id] = plainObject;

        value.keys().forEach((key): void => {
          let keyValue: any =
            value[key] instanceof Function
              ? ((value[key] as unknown) as Function)()
              : value[key];

          plainObject[key] = this.#toPlainObject(
            keyValue,
            objects,
            additionalDataRegistry
          );
        });

        additionalDataRegistry
          .getByType(<IConstructor>value.constructor)
          .forEach((additionalData: AdditionalData): void => {
            plainObject[additionalData.key()] = this.#toPlainObject(
              additionalData.data(value),
              objects,
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
          object[key] = this.#toPlainObject(
            value,
            objects,
            additionalDataRegistry
          );

          return object;
        },
        {}
      );
    }

    return value;
  };

  constructor() {
    this.#id = ulid();
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

  toPlainObject(
    additionalDataRegistry: AdditionalDataRegistry = additionalDataRegistryInstance
  ): ObjectMap {
    const objects = {};

    return {
      hierarchy: this.#toPlainObject(this, objects, additionalDataRegistry),
      objects,
    };
  }
}

export default DataObject;
