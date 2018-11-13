import {
  addSagaModule,
  delSagaModule,
  createSagaMiddleware,
  runSagaModules
} from '../src/sagaModules';

describe('sagaModules', () => {
  test('[model.sagas] should be plain object or function', () => {
    let model = {
      namespace: 'hello',
      sagas: {
        * 'SOME_GET'(action) {
          yield 'some';
        }
      }
    };
    expect(() => addSagaModule(model, {})).not.toThrow();

    model = {
      namespace: 'hello',
      sagas: () => {
        return function* () {
          yield 'hello, sagas';
        };
      }
    };
    expect(() => addSagaModule(model, {})).not.toThrow();

    model = {
      namespace: 'hello',
      sagas: 'hello, sagas'
    };
    expect(() => addSagaModule(model, {})).toThrow(/should be plain object or function/);
  });

  test('[model.sagas] could be undefined', () => {
    const model = {namespace: 'hello'};
    expect(addSagaModule(model, {})).toEqual({});
  });

  test('should add sagas module', () => {
    let model = {
      namespace: 'hello',
      sagas: () => {
        return function* () {
          yield 'hello, sagas';
        };
      }
    };
    expect(addSagaModule(model, {})).toEqual({
      hello: [expect.any(Function)]
    });
  });

  test('should delete selectors module', () => {
    const model = {
      namespace: 'hello',
      sagas: () => {
        return function* () {
          yield 'hello, sagas';
        };
      }
    };
    let sagaModules = addSagaModule(model, {});
    sagaModules = delSagaModule('hello');
    expect(sagaModules).toEqual({});
  });
});
