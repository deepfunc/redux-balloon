import sinon from 'sinon';
import { createReducers } from '../src/reducerModules';

describe('reducerModules', () => {
  test('should createReducers', () => {
    const models = [];
    let reducer;
    let state;

    models.push({
      namespace: 'parent',
      reducers: {
        'PARENT_SOME_DO': state => {
          return { a: state.a + 1 };
        }
      },
      state: { a: 1 }
    });
    reducer = createReducers(models);
    state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      parent: { a: 1 }
    });
    state = reducer(undefined, { type: 'PARENT_SOME_DO' });
    expect(state).toEqual({
      parent: { a: 2 }
    });

    models.push({
      namespace: 'parent.b',
      reducers: {
        'PARENT_B_SOME_DO': state => {
          return { x: state.x + 1 };
        }
      },
      state: { x: 1 }
    });
    reducer = createReducers(models);
    state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      parent: {
        a: 1,
        b: { x: 1 }
      }
    });
    state = reducer(state, { type: 'PARENT_B_SOME_DO' });
    expect(state).toEqual({
      parent: {
        a: 1,
        b: { x: 2 }
      }
    });

    models.push({
      namespace: 'parent.c',
      reducers: {
        'PARENT_C_SOME_DO': (state, { payload }) => {
          return payload;
        }
      },
      state: ''
    });
    reducer = createReducers(models);
    state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      parent: {
        a: 1,
        b: { x: 1 },
        c: ''
      }
    });
    state = reducer(state, { type: 'PARENT_C_SOME_DO', payload: 'hello' });
    expect(state).toEqual({
      parent: {
        a: 1,
        b: { x: 1 },
        c: 'hello'
      }
    });

    models.push({
      namespace: 'parent1',
      reducers: {
        'PARENT1_SOME_DO': state => {
          return { a1: state.a1 + 1 };
        }
      },
      state: { a1: 1 }
    });
    models.push({
      namespace: 'parent.b.y',
      reducers: {
        'PARENT_B_Y_SOME_DO': (state) => {
          return state + 1;
        }
      },
      state: 1
    });
    reducer = createReducers(models);
    state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      parent: {
        a: 1,
        b: {
          x: 1,
          y: 1
        },
        c: ''
      },
      parent1: {
        a1: 1
      }
    });
    state = reducer(state, { type: 'PARENT_SOME_DO' });
    expect(state).toEqual({
      parent: {
        a: 2,
        b: {
          x: 1,
          y: 1
        },
        c: ''
      },
      parent1: {
        a1: 1
      }
    });
    state = reducer(state, { type: 'PARENT_B_SOME_DO' });
    expect(state).toEqual({
      parent: {
        a: 2,
        b: {
          x: 2,
          y: 1
        },
        c: ''
      },
      parent1: {
        a1: 1
      }
    });
    state = reducer(state, { type: 'PARENT_C_SOME_DO', payload: 'hello, world' });
    expect(state).toEqual({
      parent: {
        a: 2,
        b: {
          x: 2,
          y: 1
        },
        c: 'hello, world'
      },
      parent1: {
        a1: 1
      }
    });
    state = reducer(state, { type: 'PARENT_B_Y_SOME_DO' });
    expect(state).toEqual({
      parent: {
        a: 2,
        b: {
          x: 2,
          y: 2
        },
        c: 'hello, world'
      },
      parent1: {
        a1: 1
      }
    });
    state = reducer(state, { type: 'PARENT1_SOME_DO' });
    expect(state).toEqual({
      parent: {
        a: 2,
        b: {
          x: 2,
          y: 2
        },
        c: 'hello, world'
      },
      parent1: {
        a1: 2
      }
    });
  });

  test('should call onEnhanceReducer', () => {
    const modelA = {
      namespace: 'a',
      state: { count: 0 },
      reducers: {
        'COUNT_ADD': (state, { payload }) => {
          return Object.assign({}, state, { count: state.count + payload });
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

    const reducer = createReducers(reducerModules, { onEnhanceReducer });
    const initialState = reducer(undefined, { type: 'UNKNOWN' });
    reducer(initialState, { type: 'COUNT_ADD', payload: 4 });
    expect(f.callCount).toBe(1);
    expect(f.firstCall.args[0]).toEqual({ count: 0 });
    expect(f.firstCall.args[1]).toEqual({ type: 'COUNT_ADD', payload: 4 });
  });
});
