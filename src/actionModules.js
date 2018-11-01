import invariant from 'invariant';
import { assocPath, dissocPath, map, mapObjIndexed, merge } from 'ramda';
import { createAction } from 'redux-actions';
import { pathOfNS, isPlainObject, isArray } from './utils';

function addActionModule(model, existingModules) {
  const {namespace, actions} = model;
  if (typeof actions === 'undefined') {
    return existingModules;
  }

  invariant(
    typeof isPlainObject(actions),
    `[model.actions] should be plain object, but got ${typeof actions}`
  );

  return assocPath(pathOfNS(namespace), [actions], existingModules);
}

function delActionModule(namespace, existModules) {
  return dissocPath(pathOfNS(namespace), existModules);
}

function createActions(modules) {
  let actionMap = {};

  const create = (modules) => {
    if (isArray(modules)) {
      const [actionDefMap] = modules;
      return mapObjIndexed(
        (actionDef, key) => {
          const action = createAction(...actionDef);
          actionMap[key] = action;
          return action;
        },
        actionDefMap
      );
    }

    return map((module) => create(module), modules);
  };

  const actions = create(modules);
  return merge(actions, actionMap);
}

export {
  addActionModule,
  delActionModule,
  createActions
};
