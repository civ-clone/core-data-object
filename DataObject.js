"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataObject = exports.restoreIdCounters = exports.idCounters = exports.typeNameOf = void 0;
const AdditionalDataRegistry_1 = require("./AdditionalDataRegistry");
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const generateInheritance_1 = require("./lib/generateInheritance");
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
const typeNameOf = (Class) => 
// `hasOwnProperty`, not `Class.type` — `static` members are inherited, so a
// subclass of a tagged class reads its *parent's* tag. Every descendant of
// one tagged class would then save and load as that parent: an entity type
// quietly swallowing a hierarchy, and ids to match, since `idProvider` keys
// on this. The same trap `allTransient()` walks the prototype chain to avoid.
Object.prototype.hasOwnProperty.call(Class, 'type') && Class.type
    ? Class.type
    : Class.name;
exports.typeNameOf = typeNameOf;
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
const idCounters = () => Object.fromEntries(Object.entries(idCache).map(([type, count]) => [type, Number(count)]));
exports.idCounters = idCounters;
/**
 * Restore counters saved by `idCounters()`.
 *
 * Counters only ever move forward: `Math.max` against what is already there,
 * because plugin imports create entities (terrain definitions, civilisations,
 * leaders) *before* a save is loaded, and lowering a counter to the saved value
 * would then hand out ids those definitions already took.
 */
const restoreIdCounters = (counters) => Object.entries(counters).forEach(([type, count]) => {
    var _a;
    idCache[type] = Math.max(Number((_a = idCache[type]) !== null && _a !== void 0 ? _a : 0), count);
});
exports.restoreIdCounters = restoreIdCounters;
const idCache = {}, idProvider = (object) => {
    // `typeName()` rather than `.name`, so ids follow an explicit `type` tag
    // wherever one is declared. Identical today, because nothing declares one
    // yet — which is what makes this change safe to land on its own.
    const className = (0, exports.typeNameOf)(object.sourceClass()), current = idCache[className];
    if (!current) {
        idCache[className] = 0;
    }
    if (current >= Number.MAX_SAFE_INTEGER) {
        idCache[className] = BigInt(current);
    }
    return className + '-' + (++idCache[className]).toString(36);
}, toPlainObject = (value, objects, filter = (object) => object, additionalDataRegistry = AdditionalDataRegistry_1.instance) => {
    value = filter(value);
    if (value instanceof EntityRegistry_1.default) {
        value = value.entries();
    }
    if (Array.isArray(value)) {
        return value.map((item) => toPlainObject(item, objects, filter, additionalDataRegistry));
    }
    if (value instanceof DataObject) {
        const id = value.id();
        if (!(id in objects)) {
            const plainObject = {
                _: value.sourceClass().name,
                __: (0, generateInheritance_1.default)(value),
            };
            objects[id] = plainObject;
            value.keys().forEach((key) => {
                const keyValue = value[key] instanceof Function
                    ? value[key]()
                    : value[key];
                plainObject[key] = toPlainObject(keyValue, objects, filter, additionalDataRegistry);
            });
            additionalDataRegistry
                .getByType(value.sourceClass())
                .forEach((additionalData) => {
                plainObject[additionalData.key()] = toPlainObject(additionalData.data(value), objects, filter, additionalDataRegistry);
            });
        }
        return {
            '#ref': id,
        };
    }
    if (value instanceof Function) {
        return {
            _: value.name,
            __: (0, generateInheritance_1.default)(value),
        };
    }
    if (value && value instanceof Object) {
        return Object.entries(value).reduce((object, [key, value]) => {
            object[key] = toPlainObject(value, objects, filter, additionalDataRegistry);
            return object;
        }, {});
    }
    return value;
};
class DataObject {
    constructor() {
        this._keys = ['id'];
        this._id = idProvider(this);
    }
    addKey(...keys) {
        this._keys.push(...keys);
    }
    id() {
        return this._id;
    }
    keys() {
        return this._keys;
    }
    sourceClass() {
        return this.constructor;
    }
    /**
     * Every transient name for this class, including those its ancestors declare.
     *
     * `static` members are inherited, so a subclass declaring its own `transient`
     * *replaces* the parent's rather than adding to it — which would silently
     * start saving `_id` and `_keys` again. Walking the prototype chain is what
     * makes the declarations additive.
     */
    allTransient() {
        const names = new Set();
        let current = this.constructor;
        while (typeof current === 'function' && current !== Function.prototype) {
            const declared = current.transient;
            if (Array.isArray(declared)) {
                declared.forEach((name) => names.add(name));
            }
            current = Object.getPrototypeOf(current);
        }
        return [...names].sort();
    }
    /**
     * The field names that *would* be saved: own enumerable properties, minus
     * everything transient.
     *
     * This is the whole reason the `#private` → `private` migration happened.
     * With `#private` fields there was nothing to enumerate, so no generic
     * serialiser was possible at all.
     */
    stateKeys() {
        const transient = new Set(this.allTransient());
        return Object.keys(this)
            .filter((name) => !transient.has(name))
            .sort();
    }
    toPlainObject(dataObjectFilter = (object) => object, additionalDataRegistry = AdditionalDataRegistry_1.instance) {
        const objects = {};
        return {
            hierarchy: toPlainObject(this, objects, dataObjectFilter, additionalDataRegistry),
            objects,
        };
    }
}
exports.DataObject = DataObject;
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
DataObject.transient = ['_id', '_keys'];
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map