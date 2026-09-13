"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataObject = void 0;
const AdditionalDataRegistry_1 = require("./AdditionalDataRegistry");
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const generateInheritance_1 = require("./lib/generateInheritance");
const idCache = {}, idProvider = (object) => {
    const className = object.sourceClass().name, current = idCache[className];
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