import sinon from 'sinon';
import balloon, { ApiStatus } from '../src/index';
import { API_STATUS_PUT } from '../src/models/api/types';

describe('api model', () => {
  let biz;

  beforeAll(() => {
    const apiMap = {
      'COUNT_GET'() {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(6);
          }, 100);
        });
      },
      'COUNT_GET_EX'() {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(66);
          }, 100);
        });
      },
      'COUNT_GET_EX_ERR'() {
        return new Promise(() => {
          throw new Error('hi, this is an exception!');
        });
      }
    };

    biz = balloon();
    biz.run({ apiModel: { apiMap } });
  });

  test('should run api model', async () => {
    biz.model({
      namespace: 'hello',
      state: { count: 0 },
      reducers: {
        'COUNT_GET_SUCCESS': (state, { payload }) => {
          return Object.assign({}, state, { count: payload });
        },
        'COUNT_GET_EX_SUCCESS': (state, { payload }) => {
          return Object.assign({}, state, { count: payload });
        }
      },
      actions: function ({ createApiAction }) {
        return {
          getCount: createApiAction('COUNT_GET'),
          getCountEx: createApiAction('COUNT_GET_EX')
        };
      }
    });

    const { getState, actions } = biz;

    expect(getState()).toEqual({
      api: {
        'COUNT_GET': { status: ApiStatus.IDLE },
        'COUNT_GET_EX': { status: ApiStatus.IDLE },
        'COUNT_GET_EX_ERR': { status: ApiStatus.IDLE }
      },
      hello: { count: 0 }
    });

    let rst = await biz.dispatch(actions.getCount());
    expect(rst).toBe(6);
    expect(getState().hello).toEqual({ count: 6 });

    rst = await biz.dispatch(actions.getCountEx());
    expect(rst).toBe(66);
    expect(getState().hello).toEqual({ count: 66 });
    biz.unmodel('hello');
  });

  test('should generate correct api status', async () => {
    const apiStatusChangedFn = sinon.fake();
    biz.model({
      namespace: 'test',
      state: 0,
      reducers: {
        [API_STATUS_PUT]: (state, { payload, meta }) => {
          apiStatusChangedFn(payload, meta);
          return state;
        },
        'COUNT_GET_SUCCESS': (state, { payload }) => {
          return Object.assign({}, state, { count: payload });
        }
      },
      actions: function ({ createApiAction }) {
        return {
          getCount: createApiAction('COUNT_GET'),
          getCountExErr: createApiAction('COUNT_GET_EX_ERR')
        };
      }
    });

    const { actions } = biz;

    let rst = await biz.dispatch(actions.getCount());
    expect(rst).toBe(6);
    expect(apiStatusChangedFn.firstCall.args).toEqual([
      { status: ApiStatus.LOADING },
      { apiName: 'COUNT_GET' }
    ]);
    expect(apiStatusChangedFn.secondCall.args).toEqual([
      { status: ApiStatus.SUCCESS },
      { apiName: 'COUNT_GET' }
    ]);
    expect(apiStatusChangedFn.thirdCall.args).toEqual([
      { status: ApiStatus.IDLE },
      { apiName: 'COUNT_GET' }
    ]);

    apiStatusChangedFn.resetHistory();
    try {
      await biz.dispatch(actions.getCountExErr());
    } catch (e) {
      expect(e).toEqual(expect.any(Error));
      expect(e).toMatchObject({ message: 'hi, this is an exception!' });
      expect(apiStatusChangedFn.firstCall.args)
        .toEqual([{ status: ApiStatus.LOADING }, { apiName: 'COUNT_GET_EX_ERR' }]);
      expect(apiStatusChangedFn.secondCall.args).toEqual([
        { status: ApiStatus.FAILURE, error: expect.any(Error) },
        { apiName: 'COUNT_GET_EX_ERR' }
      ]);
      expect(apiStatusChangedFn.thirdCall.args).toEqual([
        { status: ApiStatus.IDLE },
        { apiName: 'COUNT_GET_EX_ERR' }
      ]);
    }
  });
});
