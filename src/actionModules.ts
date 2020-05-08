import { createAction } from 'redux-actions';
import { ActionDefinitionTuple, ActionsDefinition } from './types/actions';
import { Model } from './types/model';
import { StringIndexObject } from './types/utils';
import { actionDefiner, isActionDefinitionTuple } from './actionDefiner';
import {
  assocPath,
  dissocPath,
  mapObjIndexed,
  pathArrayOfNS,
  isArray,
  identity
} from './utils';

function addActionModule(
  model: Model<any, any, any>,
  existingModules: StringIndexObject = {}
): StringIndexObject {
  const { namespace, actions } = model;
  if (typeof actions === 'undefined') {
    return existingModules;
  }

  return assocPath(pathArrayOfNS(namespace), [actions], existingModules);
}

function delActionModule(
  namespace: string,
  existingModules: StringIndexObject
): StringIndexObject {
  return dissocPath(pathArrayOfNS(namespace), existingModules);
}

function createActions(modules: StringIndexObject): StringIndexObject {
  const actionMap: StringIndexObject = {};

  const create: (
    modules: StringIndexObject | [ActionsDefinition<any>]
  ) => StringIndexObject = modules => {
    if (isArray(modules)) {
      const [actionDefFunc] = modules;
      const actionDefMap = actionDefFunc(actionDefiner);

      return mapObjIndexed(
        (item: string | ActionDefinitionTuple<any, any>, key) => {
          let action: Function;
          if (isActionDefinitionTuple(item)) {
            const type = item[0];
            const payloadCreator = item[1] != null ? item[1] : identity;
            const metaCreator = item[2];
            if (metaCreator == null) {
              action = createAction(type, payloadCreator);
            } else {
              action = createAction(type, payloadCreator, metaCreator);
            }
          } else {
            action = createAction(item);
          }

          actionMap[key] = action;
          return action;
        },
        actionDefMap
      );
    }

    return mapObjIndexed(mod => create(mod), modules);
  };

  const actions = create(modules);
  return { ...actions, ...actionMap };
}

export { addActionModule, delActionModule, createActions };
