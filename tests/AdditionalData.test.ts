import AdditionalData from '../AdditionalData';
import AdditionalDataRegistry from '../AdditionalDataRegistry';
import DataObject from '../DataObject';
import { expect } from 'chai';

class A extends DataObject {
  constructor() {
    super();

    this.addKey('a');
  }

  a(): string {
    return 'a';
  }
}

class B extends DataObject {
  constructor() {
    super();

    this.addKey('a');
  }

  a(): string {
    return 'a';
  }
}

class C extends DataObject {
  constructor() {
    super();
  }
}

describe('AdditionalData', (): void => {
  it('should allow DataObjects to be augmented', (): void => {
    const additionalDataRegistry = new AdditionalDataRegistry(),
      additionalData = new AdditionalData(A, 'b', () => new B()),
      a = new A();

    additionalDataRegistry.register(additionalData);

    const plainA = a.toPlainObject(additionalDataRegistry);

    expect(plainA).to.a('object').keys('_', 'a', 'b');
    expect(plainA.b).to.a('object').keys('_', 'a');
    expect(plainA.b._).to.equal('B');
    expect(plainA.b.a).to.equal('a');
  });

  it('should allow DataObjects to be augmented and be nested', (): void => {
    const additionalDataRegistry = new AdditionalDataRegistry(),
      additionalDataA = new AdditionalData(A, 'b', () => new B()),
      additionalDataB = new AdditionalData(B, 'b', () => new C()),
      additionalDataC = new AdditionalData(C, 'a', () => 'static a'),
      a = new A();

    additionalDataRegistry.register(
      additionalDataA,
      additionalDataB,
      additionalDataC
    );

    const plainA = a.toPlainObject(additionalDataRegistry);

    expect(plainA).to.a('object').keys('_', 'a', 'b');
    expect(plainA.b).to.a('object').keys('_', 'a', 'b');
    expect(plainA.b._).to.equal('B');
    expect(plainA.b.a).to.equal('a');
    expect(plainA.b.b).to.a('object').keys('_', 'a');
    expect(plainA.b.b._).to.equal('C');
    expect(plainA.b.b.a).to.equal('static a');
  });
});