import { AdditionalDataRegistry } from './AdditionalDataRegistry';
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
  addKey(...keys: (string | number | symbol)[]): void;
  id(): string;
  keys(): (string | number | symbol)[];
  sourceClass(): IConstructor<this>;
  toPlainObject(): PlainObject;
}
export declare class DataObject implements IDataObject {
  #private;
  constructor();
  addKey(...keys: (keyof this)[]): void;
  id(): string;
  keys(): (keyof this)[];
  sourceClass<T extends NewableFunction>(): T;
  toPlainObject(
    dataObjectFilter?: DataObjectFilter,
    additionalDataRegistry?: AdditionalDataRegistry
  ): ObjectMap;
}
export default DataObject;
