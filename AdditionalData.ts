import { IConstructor } from '@civ-clone/core-registry/Registry';

export interface IAdditionalData {
  data(...args: any[]): any;
  key(): string;
  type(): IConstructor;
}

export class AdditionalData implements IAdditionalData {
  #key: string;
  #provider: (...args: any[]) => any;
  #type: IConstructor;

  constructor(
    type: IConstructor,
    key: string,
    provider: (...args: any[]) => any
  ) {
    this.#key = key;
    this.#provider = provider;
    this.#type = type;
  }

  data(...args: any[]): any {
    return this.#provider(...args);
  }

  key(): string {
    return this.#key;
  }

  type(): IConstructor {
    return this.#type;
  }
}

export default AdditionalData;
