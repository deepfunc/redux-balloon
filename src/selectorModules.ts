import * as Reselect from 'reselect';
import {
  assocPath,
  dissocPath,
  pathArrayOfNS,
  mapObjIndexed,
  isArray,
  forEachObjIndexed,
  path
} from './utils';
import { SelectorsDefinition, GetSelectorFunc } from './types/selectors';
import { Model } from './types/model';
import { StringIndexObject } from './types/utils';

function addSelectorModule(
  model: Model,
  existingModules: StringIndexObject = {}
): StringIndexObject {
  const { namespace, selectors } = model;
  if (typeof selectors === 'undefined') {
    return existingModules;
  }

  const pathArray = pathArrayOfNS(namespace);
  return assocPath(
    pathArrayOfNS(namespace),
    [selectors, pathArray],
    existingModules
  );
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

  const createSelectorMap = (
    defFunc: SelectorsDefinition<any>,
    namespacePathArray: string[]
  ): StringIndexObject => {
    const map = defFunc({
      getSelector,
      ...Reselect
    });
    forEachObjIndexed((selector, key) => {
      map[key] = function (state: any, ...args: any[]) {
        state = path(namespacePathArray, state);
        return selector.call(this, state, ...args);
      };
    }, map);
    selectorMap = { ...selectorMap, ...map };
    return map;
  };

  const create = (modules: StringIndexObject): StringIndexObject => {
    if (isArray(modules)) {
      const [selectorDefFunc, namespacePathArray] = modules;
      return createSelectorMap(selectorDefFunc, namespacePathArray);
    }

    return mapObjIndexed(mod => create(mod), modules);
  };

  return { ...create(modules), ...selectorMap };
}

export { addSelectorModule, delSelectorModule, createSelectors };
