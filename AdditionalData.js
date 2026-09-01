"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdditionalData = void 0;
class AdditionalData {
    constructor(type, key, provider) {
        this._key = key;
        this._provider = provider;
        this._type = type;
    }
    data(...args) {
        return this._provider(...args);
    }
    key() {
        return this._key;
    }
    type() {
        return this._type;
    }
}
exports.AdditionalData = AdditionalData;
exports.default = AdditionalData;
//# sourceMappingURL=AdditionalData.js.map