import { Reducer, combineReducers } from 'redux';
import { handleActions, ReduxCompatibleReducerMeta } from 'redux-actions';
import {
  CreateReducersOptions,
  EnhanceReducerFunc
} from './types/reducers';
import { Model } from './types/model';
import { StringIndexObject } from './types/utils';
import { REDUCER_ROOT_NAMESPACE, NAMESPACE_SEP } from './constants';
import { identity, pathArrayOfNS, noop, pick } from './utils';

function createReducers(
  models: Array<Model<any>>,
  opts: CreateReducersOptions = {}
): ReduxCompatibleReducerMeta<any, any, any> {
  const { onEnhanceReducer = identity } = opts;
  const rootDef = {};

  // 每个 model 按顺序加入
  for (const model of models) {
    addModelReducer(model, rootDef, onEnhanceReducer);
  }

  // 创建 rootReducer
  let rootReducer: Reducer = identity;
  if (Object.keys(rootDef).length > 0) {
    rootReducer = combineReducers(rootDef);
  }

  return onEnhanceReducer(rootReducer, REDUCER_ROOT_NAMESPACE);
}

function addModelReducer(
  model: Model<any>,
  rootDef: StringIndexObject,
  onEnhanceReducer: EnhanceReducerFunc
): void {
  const { namespace, state = null, reducers } = model;
  if (reducers == null) {
    return;
  }

  const nodeNames = pathArrayOfNS(namespace);
  const firstLevelNodeName = nodeNames[0];
  const restNodeNames = nodeNames.slice(1);
  const modelReducer = handleActions(reducers, state);
  let firstLevelNodeReducer;

  if (nodeNames.length > 1) {
    // 处理祖先节点
    firstLevelNodeReducer = createPathLevelNodeReducer(
      rootDef[firstLevelNodeName],
      [firstLevelNodeName],
      restNodeNames,
      modelReducer,
      onEnhanceReducer
    );
  } else {
    // 没有祖先节点
    firstLevelNodeReducer = rootDef[firstLevelNodeName] || noop;
    const { childrenReducerMap } = firstLevelNodeReducer;
    firstLevelNodeReducer =
      createNodeReducer(modelReducer, childrenReducerMap, onEnhanceReducer, namespace);
  }

  // 最终目的是把第一层节点设置好
  rootDef[firstLevelNodeName] = firstLevelNodeReducer;
}

function createPathLevelNodeReducer(
  currNodeReducer: any = noop,
  curPathNodeNames: string[],
  restNodeNames: string[],
  modelReducer: ReduxCompatibleReducerMeta<any, any, any>,
  onEnhanceReducer: EnhanceReducerFunc
): any {
  const { reducer, childrenReducerMap = {} } = currNodeReducer;
  const nextLevelNodeName = restNodeNames[0];
  let nextLevelNodeReducer;

  if (restNodeNames.length === 1) {
    nextLevelNodeReducer = createNodeReducer(
      modelReducer,
      undefined,
      onEnhanceReducer,
      curPathNodeNames.concat(restNodeNames).join(NAMESPACE_SEP)
    );
  } else {
    nextLevelNodeReducer = createPathLevelNodeReducer(
      childrenReducerMap[nextLevelNodeName],
      curPathNodeNames.concat(restNodeNames[0]),
      restNodeNames.slice(1),
      modelReducer,
      onEnhanceReducer
    );
  }

  return createNodeReducer(
    reducer,
    {
      ...childrenReducerMap,
      [nextLevelNodeName]: nextLevelNodeReducer
    },
    onEnhanceReducer,
    curPathNodeNames.join(NAMESPACE_SEP)
  );
}

function createNodeReducer(
  reducer: ReduxCompatibleReducerMeta<any, any, any>,
  childrenReducerMap: StringIndexObject | undefined | null,
  onEnhanceReducer: EnhanceReducerFunc,
  namespace: string
): any {
  // 默认就是节点自身的 reducer
  let ret: any = reducer;

  if (reducer != null && childrenReducerMap != null) {
    // 即有自身又有孩子，那么先计算自身再计算孩子的，用孩子的覆盖自身同名 key
    // 孩子的值为 undefined 时不覆盖
    const childrenReducer = combineReducers(childrenReducerMap);
    const childrenKeys = Object.keys(childrenReducerMap);

    const createMergeReducer = function (
      reducer: ReduxCompatibleReducerMeta<any, any, any>,
      childrenReducer: ReduxCompatibleReducerMeta<any, any, any>,
      childrenKeys: string[]
    ) {
      return function mergeReducer(state: any, action: any) {
        const nextSelfState = reducer(state, action);
        const childrenState = state != null ? pick(childrenKeys, state) : state;
        const nextChildrenState = childrenReducer(childrenState, action);

        // 如果有属性发生变化，则返回新的 state
        const selfKeys = Object.keys(nextSelfState);
        let hasChanged = false;
        const nextState: StringIndexObject = {};
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

        return hasChanged ? nextState : state;
      };
    };

    ret = createMergeReducer(reducer, childrenReducer, childrenKeys);
  } else if (childrenReducerMap != null) {
    // 没有自身的，那么就只有孩子的
    ret = combineReducers(childrenReducerMap);
  }

  ret = onEnhanceReducer(
    ret,
    REDUCER_ROOT_NAMESPACE + NAMESPACE_SEP + namespace
  );
  ret.reducer = reducer;
  ret.childrenReducerMap = childrenReducerMap;
  return ret;
}

export { createReducers };
