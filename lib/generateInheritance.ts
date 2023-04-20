import DataObject from '../DataObject';
import { IConstructor } from '@civ-clone/core-registry/Registry';

export const generateInheritance = (object: DataObject | typeof DataObject) => {
  let constructor: IConstructor =
    object instanceof DataObject ? object.sourceClass() : object;

  const stack: (typeof DataObject)[] = [];

  while (constructor instanceof Function) {
    stack.push(constructor);

    constructor = Object.getPrototypeOf(constructor);
  }

  return stack.map((constructor) => constructor.name);
};

export default generateInheritance;
