import sinon from 'sinon';
import {
  addReducerModule,
  delReducerModule,
  createReducers
} from '../src/reducerModules';

describe('reducerModules', () => {
  test('[model.reducers] should be plain object', () => {
    const model = {namespace: 'hello', reducers: 666};
    expect(() => addReducerModule(model, {})).toThrow(/should be plain object/);
  });

  test('[model.reducers] could be undefined', () => {
    const model = {namespace: 'hello'};
    const reducerModules = addReducerModule(model, {});
    expect(reducerModules).toEqual({});
  });

  test('should add reducers module', () => {
    const reducers = {
      'SOME_DO': (state, {payload}) => state
    };
    const model = {namespace: 'hello', reducers};
    expect(addReducerModule(model, {})).toEqual({
      hello: [
        {'SOME_DO': expect.any(Function)},
        null
      ]
    });
  });

  test('should delete reducers module', () => {
    const reducers = {
      'SOME_DO': (state, {payload}) => state
    };
    const model = {namespace: 'hello', reducers};
    let reducerModules = addReducerModule(model, {});
    reducerModules = delReducerModule('hello', reducerModules);
    expect(reducerModules).toEqual({});
  });

  test('should create reducer from reducerModules', () => {
    const modelA = {
      namespace: 'a',
      state: {count: 0},
      reducers: {
        'COUNT_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      }
    };
    const modelB = {
      namespace: 'b',
      state: {content: ''},
      reducers: {
        'CONTENT_SET': (state, {payload}) => {
          return Object.assign({}, state, {content: payload});
        }
      }
    };
    let reducerModules = addReducerModule(modelA, {});
    reducerModules = addReducerModule(modelB, reducerModules);
    const reducer = createReducers(reducerModules);
    const initialState = reducer(undefined, {type: 'UNKNOWN'});

    expect(initialState).toEqual({
      a: {count: 0},
      b: {content: ''}
    });
    expect(reducer(initialState, {type: 'COUNT_ADD', payload: 4})).toEqual({
      a: {count: 4},
      b: {content: ''}
    });
    expect(reducer(initialState, {type: 'CONTENT_SET', payload: '666'})).toEqual({
      a: {count: 0},
      b: {content: '666'}
    });
  });

  test('should call onEnhanceReducer', () => {
    const modelA = {
      namespace: 'a',
      state: {count: 0},
      reducers: {
        'COUNT_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      }
    };
    let reducerModules = addReducerModule(modelA, {});
    const f = sinon.fake();
    const onEnhanceReducer = (reducer, namespace) => {
      switch (namespace) {
        case 'root.a':
          return (state, action) => {
            if (action.type === 'COUNT_ADD') {
              f(state, action);
            }
            return reducer(state, action);
          };
        default:
          return reducer;
      }
    };

    const reducer = createReducers(reducerModules, {onEnhanceReducer});
    const initialState = reducer(undefined, {type: 'UNKNOWN'});
    reducer(initialState, {type: 'COUNT_ADD', payload: 4});
    expect(f.callCount).toBe(1);
    expect(f.firstCall.args[0]).toEqual({count: 0});
    expect(f.firstCall.args[1]).toEqual({type: 'COUNT_ADD', payload: 4});
  });
});
