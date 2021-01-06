import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import AdditionalData from './AdditionalData';
import { IConstructor } from '@civ-clone/core-registry/Registry';

export interface IAdditionalDataRegistry
  extends IEntityRegistry<AdditionalData> {
  getByType(type: IConstructor): AdditionalData[];
}

export class AdditionalDataRegistry
  extends EntityRegistry<AdditionalData>
  implements IAdditionalDataRegistry {
  constructor() {
    super(AdditionalData);
  }

  getByType(type: IConstructor): AdditionalData[] {
    return this.filter(
      (additionalData: AdditionalData): boolean =>
        additionalData.type() === type
    );
  }
}

export const instance: AdditionalDataRegistry = new AdditionalDataRegistry();

export default AdditionalDataRegistry;
