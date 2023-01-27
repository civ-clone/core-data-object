"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DataObject_id, _DataObject_keys;
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
        _DataObject_id.set(this, void 0);
        _DataObject_keys.set(this, ['id']);
        __classPrivateFieldSet(this, _DataObject_id, idProvider(this), "f");
    }
    addKey(...keys) {
        __classPrivateFieldGet(this, _DataObject_keys, "f").push(...keys);
    }
    id() {
        return __classPrivateFieldGet(this, _DataObject_id, "f");
    }
    keys() {
        return __classPrivateFieldGet(this, _DataObject_keys, "f");
    }
    sourceClass() {
        return this.constructor;
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
_DataObject_id = new WeakMap(), _DataObject_keys = new WeakMap();
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map