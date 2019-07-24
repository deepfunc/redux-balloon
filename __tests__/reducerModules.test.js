import sinon from 'sinon';
import { createReducers } from '../src/reducerModules';

describe('reducerModules', () => {
  test('should create reducers', () => {
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
    const models = [];
    let reducer;
    let state;

    models.push({
      namespace: 'a',
      state: { count: 0 },
      reducers: {
        'A_COUNT_ADD': (state, { payload }) => {
          return Object.assign({}, state, { count: state.count + payload });
        }
      }
    });
    models.push({
      namespace: 'b',
      state: 0,
      reducers: {
        'B_COUNT_ADD': (state, { payload }) => {
          return state + payload;
        }
      }
    });
    models.push({
      namespace: 'a.c',
      state: { text: '' },
      reducers: {
        'A_C_UPDATE_TEXT': (state, { payload }) => {
          return { text: payload };
        }
      }
    });

    const f = sinon.fake();
    const onEnhanceReducer = (reducer, namespace) => {
      switch (namespace) {
        case 'root.a':
          return (state, action) => {
            if (action.type === 'A_COUNT_ADD') {
              f(state, action);
            }
            return reducer(state, action);
          };
        case 'root.b':
          return (state, action) => {
            if (action.type === 'B_COUNT_ADD') {
              f(state, action);
            }
            return reducer(state, action);
          };
        case 'root.a.c':
          return (state, action) => {
            if (action.type === 'A_C_UPDATE_TEXT') {
              f(state, action);
            }
            return reducer(state, action);
          };
        default:
          return reducer;
      }
    };

    reducer = createReducers(models, { onEnhanceReducer });
    state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      a: {
        count: 0,
        c: {
          text: ''
        }
      },
      b: 0
    });

    state = reducer(state, { type: 'A_COUNT_ADD', payload: 4 });
    expect(f.callCount).toBe(1);
    expect(f.firstCall.args[0]).toEqual({ count: 0, c: { text: '' } });
    expect(f.firstCall.args[1]).toEqual({ type: 'A_COUNT_ADD', payload: 4 });

    state = reducer(state, { type: 'B_COUNT_ADD', payload: 2 });
    expect(f.callCount).toBe(2);
    expect(f.secondCall.args[0]).toEqual(0);
    expect(f.secondCall.args[1]).toEqual({ type: 'B_COUNT_ADD', payload: 2 });

    state = reducer(state, { type: 'A_C_UPDATE_TEXT', payload: 'hello, world' });
    expect(f.callCount).toBe(3);
    expect(f.thirdCall.args[0]).toEqual({ text: '' });
    expect(f.thirdCall.args[1]).toEqual({
      type: 'A_C_UPDATE_TEXT',
      payload: 'hello, world'
    });

    expect(state).toEqual({
      a: {
        count: 4,
        c: {
          text: 'hello, world'
        }
      },
      b: 2
    });
  });
});
