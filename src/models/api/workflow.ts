import { isLatestForApiAction, isEveryForApiAction } from '../../actionDefiner';
import { ApiStatus } from './constants';
import {
  API_STATUS_INIT,
  API_STATUS_INIT_PUT,
  API_STATUS_PUT
} from './actionTypes';
import { StringIndexObject } from '../../types/utils';
import { ApiStatusInfo } from '../../types/models/apiModel';
import { ManualSagasDefinitionFunc } from '../../types/sagas';

const handlerMapForLatest: StringIndexObject = {};

export default function createApiWorkflowCreator(
  apiMap: StringIndexObject = {}
): ManualSagasDefinitionFunc {
  return function apiWorkflowCreator(effects, extras) {
    const { all, call, takeLatest, takeEvery, put } = effects;
    const { getAction } = extras;

    const handleInit: () => Generator<any> = function* () {
      const payload: StringIndexObject = {};
      const keys = Object.keys(apiMap);
      keys.forEach(k => {
        payload[k] = { status: ApiStatus.IDLE };
      });
      yield put({ type: API_STATUS_INIT_PUT, payload });
    };

    const createLatestHandler = function* (action: any): Generator<any> {
      const { type } = action;
      if (!handlerMapForLatest[type]) {
        handlerMapForLatest[type] = true;
        yield takeLatest(
          (action: any) => isLatestForApiAction(action) && action.type === type,
          apiActionHandler
        );

        // let latestHandler to handle it.
        yield put(action);
      }
    };

    const apiActionHandler = function* (action: any): Generator<any> {
      const { type, payload, meta, _resolve, _reject } = action;
      const apiName = meta.apiName || type;
      const apiFn = apiMap[apiName];
      const removedMeta = { ...meta };
      delete removedMeta.isApi;
      delete removedMeta.isLatest;

      try {
        if (typeof apiFn !== 'function') {
          throw new Error(`apiMap['${apiName}'] is not found!`);
        }

        yield call(updateApiStatus, apiName, { status: ApiStatus.LOADING });
        const resp = yield call(apiFn, payload);
        yield call(updateApiStatus, apiName, { status: ApiStatus.SUCCESS });
        yield put({
          type: `${type}_SUCCESS`,
          payload: resp,
          requestPayload: payload,
          meta: removedMeta
        });
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

    const updateApiStatus = function* (
      apiName: string,
      statusInfo: ApiStatusInfo
    ): Generator<any> {
      yield put({
        type: API_STATUS_PUT,
        payload: statusInfo,
        meta: { apiName }
      });
    };

    return function* apiWorkflow() {
      yield all([
        takeEvery(API_STATUS_INIT, handleInit),
        takeEvery(
          (action: any) => isLatestForApiAction(action),
          createLatestHandler
        ),
        takeEvery(
          (action: any) => isEveryForApiAction(action),
          apiActionHandler
        )
      ]);
      const initAction = yield call(getAction('initApiStatus'));
      yield put(initAction);
    };
  };
}
