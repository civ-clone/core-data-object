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
/**
 * `type` when a class declares one, its name otherwise.
 *
 * A free function rather than `static typeName()` on `DataObject`, and the
 * reason is worth keeping: the static version was written first, and
 * `ConstructorStaysAssignable` below rejected it on the spot. A required
 * static — method or property — stops `IConstructor<T>` satisfying `typeof T`,
 * which is precisely what 0.1.14 shipped and what broke 22 checkouts. The
 * guard turned a second instance of that into a compile error in the same
 * minute it was written.
 */
export declare const typeNameOf: (Class: {
  type?: string;
  name: string;
}) => string;
/**
 * The per-class id counters, for a save to carry.
 *
 * `DataObject` ids are `<type>-<counter in base 36>`, and the counter is module
 * state. Without restoring it, the first entity created after a load takes an
 * id that a loaded entity already holds — `City-1` twice, one of them
 * unreachable through `getById`. Nothing throws; the second city simply wins
 * some lookups and loses others.
 *
 * Returned as a copy, so a caller holding the result cannot move the engine's
 * counters by mutating it.
 */
export declare const idCounters: () => Record<string, number>;
/**
 * Restore counters saved by `idCounters()`.
 *
 * Counters only ever move forward: `Math.max` against what is already there,
 * because plugin imports create entities (terrain definitions, civilisations,
 * leaders) *before* a save is loaded, and lowering a counter to the saved value
 * would then hand out ids those definitions already took.
 */
export declare const restoreIdCounters: (
  counters: Record<string, number>
) => void;
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
   * The name this class is saved and identified under.
   *
   * Optional, and defaulting to `constructor.name` through `typeName()` — see
   * `02-design-review.md` §7, which recommends an explicit tag on every class
   * because the whole identity scheme (entity types, ids, the inheritance
   * chain, the renderer's translation keys) currently rests on one line in
   * `esbuild.js`: `keepNames: true`. Drop it, change bundler, or meet a
   * minifier that handles it differently, and every type silently becomes `t`,
   * `n` or `e`.
   *
   * That rollout is 303 classes across 243 packages, so it is not a
   * prerequisite for saving. What *is* a prerequisite is that mangling cannot
   * corrupt a save quietly, and `ClassRegistry` handles that by refusing a
   * name that looks mangled at registration — loudly, at startup, rather than
   * in a file someone loads next week.
   *
   * Declared optional for the reason 0.1.14 taught: a *required* static stops
   * `IConstructor<T>` satisfying `typeof T`, which broke 22 checkouts.
   */
  static readonly type?: string;
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
  static readonly transient?: readonly string[];
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
