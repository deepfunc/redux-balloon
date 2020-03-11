import { createAction } from 'redux-actions';
import {
  ActionType,
  ActionDefinitionTuple,
  ActionsDefinitionFunc,
  ActionsDefinitionMapObject,
  Model,
  StringIndexObject
} from './types';
import {
  actionDefiner,
  isActionDefinitionTuple
} from './actionDefiner';
import {
  assocPath,
  dissocPath,
  mapObjIndexed,
  pathArrayOfNS,
  isArray,
  isFunction,
  identity
} from './utils';

function addActionModule<State>(
  model: Model<State>,
  existingModules: StringIndexObject
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
    modules: StringIndexObject | [ActionsDefinitionMapObject | ActionsDefinitionFunc]
  ) => StringIndexObject = (modules) => {
    if (isArray(modules)) {
      let [actionDefMap] = modules;
      if (isFunction(actionDefMap)) {
        actionDefMap = actionDefMap(actionDefiner);
      }

      return mapObjIndexed(
        (item: ActionType | ActionDefinitionTuple<any, any>, key) => {
          let action: Function;
          if (isActionDefinitionTuple(item)) {
            const type = item[0];
            const payloadCreator = item[1] != null ? item[1] : identity;
            const metaCreator = item[2] != null ? item[2] : identity;
            action = createAction(type, payloadCreator, metaCreator);
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

export {
  addActionModule,
  delActionModule,
  createActions
};
