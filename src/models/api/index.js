import invariant from 'invariant';
import Immutable from 'seamless-immutable';
import { isPlainObject, pathOfNS, path } from '../../utils';
import { API_STATUS_INIT, API_STATUS_INIT_PUT, API_STATUS_PUT } from './types';
import createApiWorkflowCreator from './workflow';

const { merge } = Immutable;

const DEFAULT_NAMESPACE = 'api';

export default function createApiModel(opts) {
  const { namespace = DEFAULT_NAMESPACE, apiMap } = opts;
  invariant(
    isPlainObject(apiMap),
    'ApiModel.apiMap should be a plain object'
  );

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
        return payload;
      },
      [API_STATUS_PUT](state, { payload, meta }) {
        return merge(state, { [meta.apiName]: payload }, { deep: true });
      }
    },

    actions: {
      initApiStatus: API_STATUS_INIT
    },

    selectors: () => {
      const getApiStatus = function (state, apiName) {
        const apiState = path(pathOfNS(namespace), state);
        return (apiState != null) ? apiState[apiName] : undefined;
      };

      return { getApiStatus };
    },

    workflow: createApiWorkflowCreator(apiMap)
  };
};
