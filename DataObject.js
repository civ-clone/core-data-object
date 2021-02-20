"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _id, _keys, _getId, _toPlainObject;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataObject = void 0;
const AdditionalDataRegistry_1 = require("./AdditionalDataRegistry");
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const ulid_1 = require("ulid");
class DataObject {
    constructor() {
        _id.set(this, void 0);
        _keys.set(this, ['id']);
        _getId.set(this, (value) => {
            if (value instanceof DataObject) {
                return value.id();
            }
            if (value instanceof Function) {
                return value.name;
            }
            return ulid_1.ulid();
        });
        _toPlainObject.set(this, (value, objects, additionalDataRegistry = AdditionalDataRegistry_1.instance) => {
            if (value instanceof EntityRegistry_1.default) {
                value = value.entries();
            }
            if (Array.isArray(value)) {
                return value.map((item) => __classPrivateFieldGet(this, _toPlainObject).call(this, item, objects, additionalDataRegistry));
            }
            if (value instanceof DataObject) {
                const id = __classPrivateFieldGet(this, _getId).call(this, value);
                if (!(id in objects)) {
                    const plainObject = {
                        _: value.constructor.name,
                    };
                    objects[id] = plainObject;
                    value.keys().forEach((key) => {
                        let keyValue = value[key] instanceof Function
                            ? value[key]()
                            : value[key];
                        plainObject[key] = __classPrivateFieldGet(this, _toPlainObject).call(this, keyValue, objects, additionalDataRegistry);
                    });
                    additionalDataRegistry
                        .getByType(value.constructor)
                        .forEach((additionalData) => {
                        plainObject[additionalData.key()] = __classPrivateFieldGet(this, _toPlainObject).call(this, additionalData.data(value), objects, additionalDataRegistry);
                    });
                }
                return {
                    '#ref': id,
                };
            }
            if (value instanceof Function) {
                return {
                    _: value.name,
                };
            }
            if (value && value instanceof Object) {
                return Object.entries(value).reduce((object, [key, value]) => {
                    object[key] = __classPrivateFieldGet(this, _toPlainObject).call(this, value, objects, additionalDataRegistry);
                    return object;
                }, {});
            }
            return value;
        });
        __classPrivateFieldSet(this, _id, ulid_1.ulid());
    }
    addKey(...keys) {
        __classPrivateFieldGet(this, _keys).push(...keys);
    }
    id() {
        return __classPrivateFieldGet(this, _id);
    }
    keys() {
        return __classPrivateFieldGet(this, _keys);
    }
    toPlainObject(additionalDataRegistry = AdditionalDataRegistry_1.instance) {
        const objects = {};
        return {
            hierarchy: __classPrivateFieldGet(this, _toPlainObject).call(this, this, objects, additionalDataRegistry),
            objects,
        };
    }
}
exports.DataObject = DataObject;
_id = new WeakMap(), _keys = new WeakMap(), _getId = new WeakMap(), _toPlainObject = new WeakMap();
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map