import { Reducer, combineReducers } from 'redux';
import { handleActions, ReduxCompatibleReducerMeta } from 'redux-actions';
import {
  Model,
  CreateReducersOptions,
  EnhanceReducerFunc,
  StringIndexObject
} from './types';
import { REDUCER_ROOT_NAMESPACE, NAMESPACE_SEP } from './constants';
import { identity, pathOfNS, noop, pick } from './utils';

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

}
