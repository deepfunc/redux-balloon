import invariant from 'invariant';
import Immutable from 'seamless-immutable';
import {
  ApiModelOptions,
  ApiModelActions,
  ApiModelSelectors,
  ApiModelState,
  Model
} from '../..';
import { isPlainObject } from '../../utils';
import {
  API_STATUS_INIT,
  API_STATUS_INIT_PUT,
  API_STATUS_PUT
} from './actionTypes';
import createApiWorkflowCreator from './workflow';

const { merge } = Immutable;

const DEFAULT_NAMESPACE = 'api';

export default function createApiModel(
  opts: ApiModelOptions
): Model<ApiModelState, ApiModelActions, ApiModelSelectors> {
  const { namespace = DEFAULT_NAMESPACE, apiMap } = opts;
  invariant(isPlainObject(apiMap), 'ApiModel.apiMap should be a plain object');

  return {
    namespace,

    state: {
      /**
       * [apiName]: { status: ApiStatus.* }
       * ...
       */
    },

    reducers: {
      [API_STATUS_INIT_PUT](state, { payload }) {
        return merge(state, payload);
      },
      [API_STATUS_PUT](state, { payload, meta }) {
        return merge(state, { [meta.apiName]: payload }, { deep: true });
      }
    },

    actions: () => ({
      initApiStatus: API_STATUS_INIT
    }),

    selectors: () => {
      return {
        getApiStatus(state, apiName) {
          return state[apiName];
        }
      };
    },

    workflow: createApiWorkflowCreator(apiMap)
  };
}
