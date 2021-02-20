import { AdditionalDataRegistry } from './AdditionalDataRegistry';
export declare type PlainObject = {
  [key: string]: any;
};
export declare type IObjectStore = {
  [key: string]: PlainObject;
};
export declare type IObjectMap = {
  hierarchy: PlainObject;
  objects: IObjectStore;
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
  toPlainObject(additionalDataRegistry?: AdditionalDataRegistry): IObjectMap;
}
export default DataObject;
