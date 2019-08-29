import { isLatestForApiAction, isEveryForApiAction } from '../../actionCreator';
import { ApiStatus } from './constants.js';
import { API_STATUS_INIT, API_STATUS_INIT_PUT, API_STATUS_PUT } from './types';

const handlerMapForLatest = {};

export default function createApiWorkflowCreator(apiMap = {}) {
  return function apiWorkflowCreator(effects, extras) {
    const { all, call, takeLatest, takeEvery, put } = effects;
    const { getAction } = extras;

    const handleInit = function* () {
      const payload = {};
      const keys = Object.keys(apiMap);
      keys.forEach(k => {
        payload[k] = { status: ApiStatus.IDLE };
      });
      yield put({ type: API_STATUS_INIT_PUT, payload });
    };

    const createLatestHandler = function* (action) {
      const { type } = action;
      if (!handlerMapForLatest[type]) {
        handlerMapForLatest[type] = true;
        yield takeLatest(
          action => isLatestForApiAction(action) && action.type === type,
          apiActionHandler
        );

        // let latestHandler to handle it.
        yield put(action);
      }
    };

    const apiActionHandler = function* (action) {
      const { type, payload, meta, _resolve, _reject } = action;
      const apiName = meta.apiName || type;
      const apiFn = apiMap[apiName];

      try {
        if (typeof apiFn !== 'function') {
          throw new Error(`apiMap['${apiName}'] is not found!`);
        }

        yield call(updateApiStatus, apiName, { status: ApiStatus.LOADING });
        const resp = yield call(apiFn, payload);
        yield call(updateApiStatus, apiName, { status: ApiStatus.SUCCESS });
        yield put({ type: `${type}_SUCCESS`, payload: resp });
        yield call(_resolve, resp);
      } catch (e) {
        yield call(updateApiStatus, apiName, {
          status: ApiStatus.FAILURE,
          error: e
        });
        yield call(_reject, e);
      } finally {
        yield call(updateApiStatus, apiName, { status: ApiStatus.IDLE });
      }
    };

    const updateApiStatus = function* (apiName, status) {
      yield put({
        type: API_STATUS_PUT,
        payload: status,
        meta: { apiName }
      });
    };

    return function* apiWorkflow() {
      yield all([
        takeEvery(API_STATUS_INIT, handleInit),
        takeEvery(action => isLatestForApiAction(action), createLatestHandler),
        takeEvery(action => isEveryForApiAction(action), apiActionHandler)
      ]);
      yield put(getAction('initApiStatus')());
    };
  };
}
