import {
  AdditionalDataRegistry,
  instance as additionalDataRegistryInstance,
} from './AdditionalDataRegistry';
import AdditionalData from './AdditionalData';
import EntityRegistry from '@civ-clone/core-registry/EntityRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import generateInheritance from './lib/generateInheritance';

export type Union<
  List extends any[],
  Key extends keyof List = keyof List
> = List[Key extends number ? Key : never];

export interface Entity<Types = string> {
  _: Types;
  __: string[];
}

export type ObjectToDataType<Object> = Object extends NewableFunction
  ? Entity<Object['name']>
  : Object extends IDataObject<
      infer ExportedFields extends string,
      infer AdditionalData
    >
  ? Entity & {
    [Key in Extract<keyof Object, ExportedFields>]: ObjectToDataType<
      Object[Key]
    >;
  } & {
      [Key in keyof AdditionalData]: ObjectToDataType<AdditionalData[Key]>;
    }
  : Object extends (...args: unknown[]) => infer Return
  ? ObjectToDataType<Return>
  : Object extends { [key: string]: unknown }
  ? {
      [Key in keyof Object]: ObjectToDataType<Object[Key]>;
    }
  : Object extends Array<infer T>
  ? ObjectToDataType<T>[]
  : Object;

export type DataObjectFilter<ObjectType extends IDataObject = DataObject> = (
  object: ObjectType
) => any;

export type ExportedFields = 'id';

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

const idCache: { [key: string]: number | bigint } = {},
  idProvider = (object: DataObject) => {
    const className = object.className(),
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
          _: value.className(),
          __: value.hierarchy(),
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

export interface IDataObject<
  ExportedProperties extends string = string,
  AdditionalData extends Object = {}
> {
  addKey(...keys: (string | number | symbol)[]): void;
  className(): string;
  hierarchy(): string[];
  id(): string;
  keys(): (string | number | symbol)[];
  sourceClass(): IConstructor<this>;
  toPlainObject(): PlainObject;

  ___ExportedFields?: ExportedProperties;
  ___AdditionalData?: AdditionalData;
}

export class DataObject<
  ExportedProperties extends string = string,
  AdditionalData extends Object = {}
> implements IDataObject<ExportedProperties, AdditionalData>
{
  #id: string;
  #keys: (keyof this)[] = ['id'];

  ___ExportedFields?: ExportedProperties;
  ___AdditionalData?: AdditionalData;

  constructor() {
    this.#id = idProvider(this);
  }

  addKey(...keys: (keyof this)[]): void {
    this.#keys.push(...keys);
  }

  className(): string {
    return this.sourceClass().name;
  }

  hierarchy(): string[] {
    return generateInheritance(this);
  }

  id(): string {
    return this.#id;
  }

  keys(): (keyof this)[] {
    return this.#keys;
  }

  sourceClass<T extends NewableFunction>(): T {
    return this.constructor as T;
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
