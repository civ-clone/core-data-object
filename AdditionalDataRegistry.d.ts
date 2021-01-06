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
export declare class AdditionalDataRegistry
  extends EntityRegistry<AdditionalData>
  implements IAdditionalDataRegistry {
  constructor();
  getByType(type: IConstructor): AdditionalData[];
}
export declare const instance: AdditionalDataRegistry;
export default AdditionalDataRegistry;
