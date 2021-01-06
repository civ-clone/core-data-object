import { AdditionalDataRegistry } from './AdditionalDataRegistry';
export declare type PlainObject = {
  [key: string]: any;
};
export interface IDataObject {
  addKey(...keys: (keyof this)[]): void;
  keys(): (keyof this)[];
  toPlainObject(): PlainObject;
}
export declare class DataObject implements IDataObject {
  #private;
  addKey(...keys: (keyof this)[]): void;
  keys(): (keyof this)[];
  toPlainObject(additionalDataRegistry?: AdditionalDataRegistry): PlainObject;
}
export default DataObject;
