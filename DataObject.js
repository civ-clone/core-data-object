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
    toPlainObject(dataObjectFilter = (object) => object, additionalDataRegistry = AdditionalDataRegistry_1.instance) {
        const objects = {};
        return {
            hierarchy: toPlainObject(this, objects, dataObjectFilter, additionalDataRegistry),
            objects,
        };
    }
}
exports.DataObject = DataObject;
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map