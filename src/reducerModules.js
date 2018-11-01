import invariant from 'invariant';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import { assocPath, dissocPath, map } from 'ramda';
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

function createReducers(modules) {
  if (isArray(modules)) {
    const [handlers, state] = modules;
    return handleActions(handlers, state);
  }

  const reducers = map((module) => createReducers(module), modules);

  return combineReducers(reducers);
}

export {
  addReducerModule,
  delReducerModule,
  createReducers
};
