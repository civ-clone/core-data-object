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
var _AdditionalData_key, _AdditionalData_provider, _AdditionalData_type;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdditionalData = void 0;
class AdditionalData {
    constructor(type, key, provider) {
        _AdditionalData_key.set(this, void 0);
        _AdditionalData_provider.set(this, void 0);
        _AdditionalData_type.set(this, void 0);
        __classPrivateFieldSet(this, _AdditionalData_key, key, "f");
        __classPrivateFieldSet(this, _AdditionalData_provider, provider, "f");
        __classPrivateFieldSet(this, _AdditionalData_type, type, "f");
    }
    data(...args) {
        return __classPrivateFieldGet(this, _AdditionalData_provider, "f").call(this, ...args);
    }
    key() {
        return __classPrivateFieldGet(this, _AdditionalData_key, "f");
    }
    type() {
        return __classPrivateFieldGet(this, _AdditionalData_type, "f");
    }
}
exports.AdditionalData = AdditionalData;
_AdditionalData_key = new WeakMap(), _AdditionalData_provider = new WeakMap(), _AdditionalData_type = new WeakMap();
exports.default = AdditionalData;
//# sourceMappingURL=AdditionalData.js.map