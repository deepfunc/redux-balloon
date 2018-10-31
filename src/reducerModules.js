import invariant from 'invariant';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import { assocPath, map } from 'ramda';
import { pathOfNS, isPlainObject, isArray } from './utils';

function updateReducerModules(model, modules) {
  const {namespace, state = null, reducers} = model;
  if (typeof reducers === 'undefined') {
    return modules;
  }

  invariant(
    isPlainObject(reducers),
    `[model.reducers] should be plain object, but got ${typeof reducers}`
  );

  return assocPath(pathOfNS(namespace), [reducers, state], modules);
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
  updateReducerModules,
  createReducers
};
