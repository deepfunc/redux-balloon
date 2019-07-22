import checkModel from '../src/checkModel';

describe('checkModel', () => {
  test('namespace should be defined', () => {
    expect(() => checkModel({})).toThrow();
  });

  test('namespace should be string', () => {
    expect(() => checkModel({ namespace: 666 })).toThrow();
  });

  test('namespace should be unique', () => {
    const existingModels = [{ namespace: 'some' }];
    expect(() => checkModel({ namespace: 'some' }, existingModels)).toThrow();
  });
});
