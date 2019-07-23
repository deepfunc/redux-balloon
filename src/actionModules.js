import { createAction } from 'redux-actions';
import {
  assocPath,
  dissocPath,
  mapObjIndexed,
  pathOfNS,
  isArray
} from './utils';

function addActionModule(model, existingModules) {
  const { namespace, actions } = model;
  if (typeof actions === 'undefined') {
    return existingModules;
  }

  return assocPath(pathOfNS(namespace), [actions], existingModules);
}

function delActionModule(namespace, existingModules) {
  return dissocPath(pathOfNS(namespace), existingModules);
}

function createActions(modules) {
  let actionMap = {};

  const create = (modules) => {
    if (isArray(modules)) {
      const [actionDefMap] = modules;
      return mapObjIndexed(
        (actionDef, key) => {
          if (typeof actionDef === 'string' || actionDef instanceof String) {
            actionDef = [actionDef];
          }
          const action = createAction(...actionDef);
          actionMap[key] = action;
          return action;
        },
        actionDefMap
      );
    }

    return mapObjIndexed((module) => create(module), modules);
  };

  const actions = create(modules);
  return { ...actions, ...actionMap };
}

export {
  addActionModule,
  delActionModule,
  createActions
};
