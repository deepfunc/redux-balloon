import * as Reselect from 'reselect';
import {
  assocPath,
  dissocPath,
  pathArrayOfNS,
  mapObjIndexed,
  isArray
} from './utils';
import {
  GetSelectorFunc,
  StringIndexObject,
  SelectorsDefinitionFunc, Model
} from './types';

function addSelectorModule(
  model: Model<any>,
  existingModules: StringIndexObject = {}
): StringIndexObject {
  const { namespace, selectors } = model;
  if (typeof selectors === 'undefined') {
    return existingModules;
  }

  return assocPath(pathArrayOfNS(namespace), [selectors], existingModules);
}

function delSelectorModule(
  namespace: string,
  existingModules: StringIndexObject
): StringIndexObject {
  return dissocPath(pathArrayOfNS(namespace), existingModules);
}

function createSelectors(
  modules: StringIndexObject,
  getSelector: GetSelectorFunc
): StringIndexObject {
  let selectorMap = {};

  const createSelectorMap = (defFunc: SelectorsDefinitionFunc): StringIndexObject => {
    const map = defFunc({
      getSelector,
      ...Reselect
    });
    selectorMap = { ...selectorMap, ...map };
    return map;
  };

  const create = (modules: StringIndexObject): StringIndexObject => {
    if (isArray(modules)) {
      const [selectorDefFunc] = modules;
      return createSelectorMap(selectorDefFunc);
    }

    return mapObjIndexed(mod => create(mod), modules);
  };

  return { ...create(modules), ...selectorMap };
}

export {
  addSelectorModule,
  delSelectorModule,
  createSelectors
};
