"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ClassRegistry = exports.MangledNameError = exports.DuplicateTypeError = void 0;
const DataObject_1 = require("./DataObject");
class DuplicateTypeError extends Error {
}
exports.DuplicateTypeError = DuplicateTypeError;
class MangledNameError extends Error {
}
exports.MangledNameError = MangledNameError;
/**
 * Type name → class, for hydration to turn a saved `type` back into something
 * it can allocate.
 *
 * Populated explicitly. The twelve `ConstructorRegistry` instances already hold
 * most of the concrete classes and can be handed over wholesale with
 * `registerFrom`, but entity classes that live nowhere else — `City`, `Unit`,
 * `Tile` — have to be registered by their packages.
 */
class ClassRegistry {
    constructor() {
        this._classes = new Map();
    }
    /**
     * Register one or more classes under `type` if declared, `name` otherwise.
     *
     * Two refusals, both of which would otherwise surface as a corrupt save
     * rather than as an error:
     *
     * **A name of one character or less.** `02-design-review.md` §7 records that
     * the whole identity scheme rests on `keepNames: true` in `esbuild.js` —
     * drop it and every class becomes `t`, `n`, `e`. Saves would then be written
     * with single-letter types and be unreadable by any other build. An explicit
     * `static type` on all 303 classes is the real fix and is 243 packages of
     * work; refusing the mangled case costs nothing and turns a silent
     * corruption into a startup failure. It cannot false-positive: the shortest
     * real class name in the engine is `Or`, at two characters, and that is a
     * rule combinator rather than a `DataObject`.
     *
     * **A duplicate.** Two classes claiming one name means a save's `type` is
     * ambiguous and hydration would pick whichever registered last. This is also
     * the second line of defence against mangling, since names collide long
     * before all 517 of them are exhausted.
     */
    register(...classes) {
        classes.forEach((Class) => {
            const name = (0, DataObject_1.typeNameOf)(Class);
            if (name.length <= 1) {
                throw new MangledNameError(`Refusing to register a class as '${name}'. A name this short means ` +
                    'the bundle has been minified without `keepNames: true`, and ' +
                    'saves written now would be unreadable by any other build. Either ' +
                    'restore `keepNames` or give the class an explicit `static type`.');
            }
            const existing = this._classes.get(name);
            if (existing && existing !== Class) {
                throw new DuplicateTypeError(`Two classes claim the type '${name}'. A save recording it would be ` +
                    'ambiguous, so hydration cannot be allowed to guess. Give one of ' +
                    'them an explicit `static type`.');
            }
            this._classes.set(name, Class);
        });
    }
    /**
     * Every class in a `ConstructorRegistry`-shaped registry.
     *
     * Structural rather than an import of `ConstructorRegistry`, so this stays
     * usable from anything holding a list of classes and `core-data-object` does
     * not grow a dependency for one method signature.
     */
    registerFrom(registry) {
        this.register(...registry
            .entries()
            .filter((entry) => typeof entry === 'function'));
    }
    get(name) {
        var _a;
        return (_a = this._classes.get(name)) !== null && _a !== void 0 ? _a : null;
    }
    has(name) {
        return this._classes.has(name);
    }
    names() {
        return [...this._classes.keys()].sort();
    }
    get length() {
        return this._classes.size;
    }
}
exports.ClassRegistry = ClassRegistry;
exports.instance = new ClassRegistry();
exports.default = ClassRegistry;
//# sourceMappingURL=ClassRegistry.js.map