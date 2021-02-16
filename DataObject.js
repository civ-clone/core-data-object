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
var _id, _keys, _toPlainObject;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataObject = void 0;
const AdditionalDataRegistry_1 = require("./AdditionalDataRegistry");
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const ulid_1 = require("ulid");
class DataObject {
    constructor() {
        _id.set(this, void 0);
        _keys.set(this, ['id']);
        _toPlainObject.set(this, (value, additionalDataRegistry = AdditionalDataRegistry_1.instance) => {
            if (value instanceof EntityRegistry_1.default) {
                value = value.entries();
            }
            if (Array.isArray(value)) {
                return value.map((item) => __classPrivateFieldGet(this, _toPlainObject).call(this, item, additionalDataRegistry));
            }
            if (value instanceof DataObject) {
                return value.toPlainObject(additionalDataRegistry);
            }
            if (value instanceof Function) {
                return {
                    _: value.name,
                };
            }
            if (typeof value !== 'object' || value === null) {
                return value;
            }
            return Object.entries(value).reduce((object, [key, value]) => {
                object[key] = __classPrivateFieldGet(this, _toPlainObject).call(this, value, additionalDataRegistry);
                return object;
            }, {});
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
        const object = this.keys().reduce((object, key) => {
            const value = this[key] instanceof Function
                ? this[key]()
                : this[key];
            object[key] = __classPrivateFieldGet(this, _toPlainObject).call(this, value, additionalDataRegistry);
            return object;
        }, {
            _: this.constructor.name,
        });
        additionalDataRegistry
            .getByType(this.constructor)
            .forEach((additionalData) => (object[additionalData.key()] = __classPrivateFieldGet(this, _toPlainObject).call(this, additionalData.data(this), additionalDataRegistry)));
        return object;
    }
}
exports.DataObject = DataObject;
_id = new WeakMap(), _keys = new WeakMap(), _toPlainObject = new WeakMap();
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map