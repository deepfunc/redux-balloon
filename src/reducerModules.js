import invariant from 'invariant';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import { assocPath, dissocPath, mapObjIndexed, identity } from 'ramda';
import { NAMESPACE_SEP, REDUCER_ROOT_NAMESPACE } from './constants';
import { pathOfNS, isPlainObject, isArray } from './utils';

function addReducerModule(model, existingModules) {
  const {namespace, state = null, reducers} = model;
  if (typeof reducers === 'undefined') {
    return existingModules;
  }

  invariant(
    isPlainObject(reducers),
    `[model.reducers] should be plain object, but got ${typeof reducers}`
  );

  return assocPath(pathOfNS(namespace), [reducers, state], existingModules);
}

function delReducerModule(namespace, existModules) {
  return dissocPath(pathOfNS(namespace), existModules);
}

function createReducers(modules, opts) {
  const {onEnhanceReducer = identity} = opts;
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

export {
  addReducerModule,
  delReducerModule,
  createReducers
};
