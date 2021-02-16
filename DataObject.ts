import {
  AdditionalDataRegistry,
  instance as additionalDataRegistryInstance,
} from './AdditionalDataRegistry';
import AdditionalData from './AdditionalData';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { ulid } from 'ulid';

export type PlainObject = { [key: string]: any };

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
    additionalDataRegistry: AdditionalDataRegistry = additionalDataRegistryInstance
  ): PlainObject | any[] => {
    if (value instanceof EntityRegistry) {
      value = value.entries();
    }

    if (Array.isArray(value)) {
      return value.map(
        (item: any): PlainObject =>
          this.#toPlainObject(item, additionalDataRegistry)
      );
    }

    if (value instanceof DataObject) {
      return value.toPlainObject(additionalDataRegistry);
    }

    if (value instanceof Function) {
      return {
        _: value.name,
      };
    }

    if (typeof value !== 'object' || value === null) {
      return value;
    }

    return Object.entries(value).reduce(
      (object: any, [key, value]: [string, any]): any => {
        object[key] = this.#toPlainObject(value, additionalDataRegistry);

        return object;
      },
      {}
    );
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
  ): PlainObject {
    const object = this.keys().reduce(
      (object: PlainObject, key: keyof this): PlainObject => {
        const value: any =
          this[key] instanceof Function
            ? ((this[key] as unknown) as Function)()
            : this[key];

        object[key as string] = this.#toPlainObject(
          value,
          additionalDataRegistry
        );

        return object;
      },
      {
        _: this.constructor.name,
      }
    );

    additionalDataRegistry
      .getByType(<IConstructor>this.constructor)
      .forEach(
        (additionalData: AdditionalData) =>
          ((object as PlainObject)[additionalData.key()] = this.#toPlainObject(
            additionalData.data(this),
            additionalDataRegistry
          ))
      );

    return object;
  }
}

export default DataObject;
