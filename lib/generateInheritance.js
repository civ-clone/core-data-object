"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInheritance = void 0;
const DataObject_1 = require("../DataObject");
const generateInheritance = (object) => {
    let constructor = object instanceof DataObject_1.default
        ? object.sourceClass()
        : object;
    const stack = [];
    while (constructor instanceof Function) {
        stack.push(constructor);
        constructor = Object.getPrototypeOf(constructor);
    }
    return stack.map((constructor) => constructor.name);
};
exports.generateInheritance = generateInheritance;
exports.default = exports.generateInheritance;
//# sourceMappingURL=generateInheritance.js.map