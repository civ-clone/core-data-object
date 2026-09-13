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
  allTransient(): readonly string[];
  id(): string;
  stateKeys(): string[];
  keys(): (string | number | symbol)[];
  sourceClass(): IConstructor<this>;
  toPlainObject(): PlainObject;
}
export declare class DataObject implements IDataObject {
  /**
   * Field names this class does not want saved.
   *
   * **Opt-out, not opt-in.** A field added later is saved by default, so
   * forgetting to declare it wastes bytes; the reverse would lose data
   * silently, and a save format that quietly drops a new field is worse than
   * one that carries a few it did not need.
   *
   * What belongs here is anything the loading game supplies rather than the
   * file: registries, the engine, the generator. Since every constructor in
   * the engine already takes those as parameters, and a `Game` holds them, a
   * transient field is not a hole in the save — it is a field with a different
   * source.
   *
   * Caches belong here too, for a different reason: they are derived, so
   * restoring them would restore a stale answer.
   */
  static readonly transient: readonly string[];
  private _id;
  private _keys;
  constructor();
  addKey(...keys: (keyof this)[]): void;
  id(): string;
  keys(): (keyof this)[];
  sourceClass<T extends NewableFunction>(): T;
  /**
   * Every transient name for this class, including those its ancestors declare.
   *
   * `static` members are inherited, so a subclass declaring its own `transient`
   * *replaces* the parent's rather than adding to it — which would silently
   * start saving `_id` and `_keys` again. Walking the prototype chain is what
   * makes the declarations additive.
   */
  allTransient(): readonly string[];
  /**
   * The field names that *would* be saved: own enumerable properties, minus
   * everything transient.
   *
   * This is the whole reason the `#private` → `private` migration happened.
   * With `#private` fields there was nothing to enumerate, so no generic
   * serialiser was possible at all.
   */
  stateKeys(): string[];
  toPlainObject(
    dataObjectFilter?: DataObjectFilter,
    additionalDataRegistry?: AdditionalDataRegistry
  ): ObjectMap;
}
export default DataObject;
