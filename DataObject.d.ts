import { AdditionalDataRegistry } from './AdditionalDataRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
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
      [Key in keyof AdditionalData]: ObjectToDataType<AdditionalData[Key]>;
    } & {
      [Key in Extract<keyof Object, ExportedFields>]: ObjectToDataType<
        Object[Key]
      >;
    }
  : Object extends (...args: unknown[]) => infer Return
  ? ObjectToDataType<Return>
  : Object extends {
      [key: string]: unknown;
    }
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
export declare class DataObject<
  ExportedProperties extends string = string,
  AdditionalData extends Object = {}
> implements IDataObject<ExportedProperties, AdditionalData>
{
  #private;
  ___ExportedFields?: ExportedProperties;
  ___AdditionalData?: AdditionalData;
  constructor();
  addKey(...keys: (keyof this)[]): void;
  className(): string;
  hierarchy(): string[];
  id(): string;
  keys(): (keyof this)[];
  sourceClass<T extends NewableFunction>(): T;
  toPlainObject(
    dataObjectFilter?: DataObjectFilter,
    additionalDataRegistry?: AdditionalDataRegistry
  ): ObjectMap;
}
export default DataObject;
