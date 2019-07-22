import invariant from 'invariant';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import { NAMESPACE_SEP, REDUCER_ROOT_NAMESPACE } from './constants';
import {
  assocPath,
  dissocPath,
  mapObjIndexed,
  identity,
  pathOfNS,
  isPlainObject,
  isArray,
  init,
  noop,
  pick
} from './utils';

function addReducerModule(model, existingModules) {
  const { namespace, state = null, reducers } = model;
  if (typeof reducers === 'undefined') {
    return existingModules;
  }

  invariant(
    isPlainObject(reducers),
    `[model.reducers] should be plain object, but got ${typeof reducers}`
  );

  return assocPath(
    pathOfNS(namespace),
    [reducers, state],
    existingModules
  );
}

function delReducerModule(namespace, existingModules) {
  return dissocPath(pathOfNS(namespace), existingModules);
}

function createReducers(modules, opts = {}) {
  const { onEnhanceReducer = identity } = opts;
  const create = (modules, namespace) => {
    if (isArray(modules)) {
      const [handlers, state] = modules;
      return onEnhanceReducer(handleActions(handlers, state), namespace);
    }

    const reducers = mapObjIndexed(
      (childModule, childKey) => {
        return create(childModule, namespace + NAMESPACE_SEP + childKey);
      },
      modules
    );

    return onEnhanceReducer(combineReducers(reducers), namespace);
  };

  return create(modules, REDUCER_ROOT_NAMESPACE);
}

function testCreateReducers(models) {
  function addModelReducer(model, rootDef) {
    const { namespace, state = null, reducers } = model;
    const paths = pathOfNS(namespace);
    const parentNodeNames = init(paths);
    const firstLevelNodeName = paths[0];
    const restNodeNames = paths.slice(1);
    const modelReducer = handleActions(reducers, state);
    let firstLevelNodeReducer;

    if (parentNodeNames.length > 0) {
      // 处理祖先节点
      firstLevelNodeReducer = createPathLevelNodeReducer(
        rootDef[firstLevelNodeName],
        restNodeNames,
        modelReducer
      );
    } else {
      // 没有祖先节点
      firstLevelNodeReducer = createNodeReducer(modelReducer);
    }

    // 最终目的是把第一层节点设置好
    rootDef[firstLevelNodeName] = firstLevelNodeReducer;
  }

  function createPathLevelNodeReducer(currNodeReducer = noop, restNodeNames, modelReducer) {
    const { reducer, childrenReducerMap = {} } = currNodeReducer;
    const nextLevelNodeName = restNodeNames[0];
    let nextLevelNodeReducer;

    if (restNodeNames.length === 1) {
      nextLevelNodeReducer = createNodeReducer(modelReducer);
    } else {
      nextLevelNodeReducer = createPathLevelNodeReducer(
        childrenReducerMap[nextLevelNodeName],
        restNodeNames.slice(1),
        modelReducer
      );
    }

    return createNodeReducer(
      reducer,
      {
        ...childrenReducerMap,
        [nextLevelNodeName]: nextLevelNodeReducer
      }
    );
  }

  function createNodeReducer(reducer, childrenReducerMap) {
    // 默认就是节点自身的 reducer
    let ret = reducer;

    if (reducer != null && childrenReducerMap != null) {
      // 即有自身又有孩子，那么先计算自身再计算孩子的，用孩子的覆盖自身同名 key
      // 孩子的值为 undefined 时不覆盖
      const childrenReducer = combineReducers(childrenReducerMap);
      const childrenKeys = Object.keys(childrenReducerMap);

      const createMergeReducer = function (reducer, childrenReducer, childrenKeys) {
        return function mergeReducer(state, action) {
          const nextSelfState = reducer(state, action);
          const childrenState = state != null ? pick(childrenKeys, state) : state;
          const nextChildrenState = childrenReducer(childrenState, action);

          // 如果有属性发生变化，则返回新的 state
          const selfKeys = Object.keys(nextSelfState);
          let hasChanged = false;
          const nextState = {};
          for (const key of selfKeys) {
            nextState[key] = nextSelfState[key];
            hasChanged = hasChanged || state === undefined || nextState[key] !== state[key];
          }
          for (const key of childrenKeys) {
            const nextStateForChildKey = nextChildrenState[key];
            if (nextState[key] !== undefined && nextStateForChildKey === undefined) {
              continue;
            }
            nextState[key] = nextChildrenState[key];
            hasChanged = hasChanged || state === undefined || nextState[key] !== state[key];
          }

          // console.log('action', action);
          // console.log('state', state);
          // console.log('hasChanged', hasChanged);
          return hasChanged ? nextState : state;
        };
      };

      ret = createMergeReducer(reducer, childrenReducer, childrenKeys);
    } else if (childrenReducerMap != null) {
      // 没有自身的，那么就只有孩子的
      ret = combineReducers(childrenReducerMap);
    }

    ret.reducer = reducer;
    ret.childrenReducerMap = childrenReducerMap;
    return ret;
  }

  const rootDef = {};

  for (const model of models) {
    // 每个 model 按顺序加入
    addModelReducer(model, rootDef);
  }

  // 创建 rootReducer
  return combineReducers(rootDef);
}

export {
  addReducerModule,
  delReducerModule,
  createReducers,
  testCreateReducers
};
