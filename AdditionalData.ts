import { IConstructor } from '@civ-clone/core-registry/Registry';

export interface IAdditionalData {
  data(...args: any[]): any;
  key(): string;
  type(): IConstructor;
}

export class AdditionalData implements IAdditionalData {
  private _key: string;
  private _provider: (...args: any[]) => any;
  private _type: IConstructor;

  constructor(
    type: IConstructor,
    key: string,
    provider: (...args: any[]) => any
  ) {
    this._key = key;
    this._provider = provider;
    this._type = type;
  }

  data(...args: any[]): any {
    return this._provider(...args);
  }

  key(): string {
    return this._key;
  }

  type(): IConstructor {
    return this._type;
  }
}

export default AdditionalData;
