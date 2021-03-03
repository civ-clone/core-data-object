"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconstituteData = void 0;
const reconstituteData = ({ hierarchy, objects, }) => {
    const seenObjects = [];
    const getReferences = (value) => {
        if (seenObjects.includes(value)) {
            return value;
        }
        seenObjects.push(value);
        if (Array.isArray(value)) {
            return value.map((value) => getReferences(value));
        }
        if (value && value['#ref']) {
            return getReferences(objects[value['#ref']]);
        }
        if (value instanceof Object) {
            Object.entries(value).forEach(([key, childValue]) => {
                value[key] = getReferences(childValue);
            });
        }
        return value;
    };
    return getReferences(hierarchy);
};
exports.reconstituteData = reconstituteData;
exports.default = exports.reconstituteData;
//# sourceMappingURL=reconstituteData.js.map