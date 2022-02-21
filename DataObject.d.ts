import { AdditionalDataRegistry } from './AdditionalDataRegistry';
export declare type DataObjectFilter = (object: DataObject) => any;
export declare type PlainObject = {
  [key: string]: any;
};
export declare type ObjectStore = {
  [key: string]: PlainObject;
};
export declare type ObjectMap = {
  hierarchy: PlainObject;
  objects: ObjectStore;
};
export interface IDataObject {
  addKey(...keys: (keyof this)[]): void;
  keys(): (keyof this)[];
  toPlainObject(): PlainObject;
}
export declare class DataObject implements IDataObject {
  #private;
  constructor();
  addKey(...keys: (keyof this)[]): void;
  id(): string;
  keys(): (keyof this)[];
  toPlainObject(
    dataObjectFilter?: DataObjectFilter,
    additionalDataRegistry?: AdditionalDataRegistry
  ): ObjectMap;
}
export default DataObject;
