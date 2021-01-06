import { IConstructor } from '@civ-clone/core-registry/Registry';
export interface IAdditionalData {
  data(...args: any[]): any;
  key(): string;
  type(): IConstructor;
}
export declare class AdditionalData implements IAdditionalData {
  #private;
  constructor(
    type: IConstructor,
    key: string,
    provider: (...args: any[]) => any
  );
  data(...args: any[]): any;
  key(): string;
  type(): IConstructor;
}
export default AdditionalData;
