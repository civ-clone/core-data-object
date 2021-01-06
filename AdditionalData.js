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
var _key, _provider, _type;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdditionalData = void 0;
class AdditionalData {
    constructor(type, key, provider) {
        _key.set(this, void 0);
        _provider.set(this, void 0);
        _type.set(this, void 0);
        __classPrivateFieldSet(this, _key, key);
        __classPrivateFieldSet(this, _provider, provider);
        __classPrivateFieldSet(this, _type, type);
    }
    data(...args) {
        return __classPrivateFieldGet(this, _provider).call(this, ...args);
    }
    key() {
        return __classPrivateFieldGet(this, _key);
    }
    type() {
        return __classPrivateFieldGet(this, _type);
    }
}
exports.AdditionalData = AdditionalData;
_key = new WeakMap(), _provider = new WeakMap(), _type = new WeakMap();
exports.default = AdditionalData;
//# sourceMappingURL=AdditionalData.js.map