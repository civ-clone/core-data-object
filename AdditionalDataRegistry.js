"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.AdditionalDataRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const AdditionalData_1 = require("./AdditionalData");
class AdditionalDataRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        super(AdditionalData_1.default);
    }
    getByType(type) {
        return this.filter((additionalData) => additionalData.type() === type);
    }
}
exports.AdditionalDataRegistry = AdditionalDataRegistry;
exports.instance = new AdditionalDataRegistry();
exports.default = AdditionalDataRegistry;
//# sourceMappingURL=AdditionalDataRegistry.js.map