import DataObject from '../DataObject';

export const generateInheritance = (object: DataObject | typeof DataObject) => {
  let constructor =
    object instanceof DataObject
      ? object.sourceClass<typeof DataObject>()
      : object;

  const stack: (typeof DataObject)[] = [];

  while (constructor instanceof Function) {
    stack.push(constructor);

    constructor = Object.getPrototypeOf(constructor);
  }

  return stack.map((constructor) => constructor.name);
};

export default generateInheritance;
