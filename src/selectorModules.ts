import * as Reselect from 'reselect';
import {
  assoc,
  dissoc,
  pathArrayOfNS,
  forEachObjIndexed,
  path,
  restoreNamespace
} from './utils';
import {
  SelectorsDefinition,
  GetSelectorFunc,
  Model,
  StringIndexObject
} from '.';

function addSelectorModule(
  model: Model,
  existingModules: StringIndexObject = {}
): StringIndexObject {
  const { namespace, selectors } = model;
  if (typeof selectors === 'undefined') {
    return existingModules;
  }

  const pathArray = pathArrayOfNS(namespace);
  return assoc(namespace, [selectors, pathArray], existingModules);
}

function delSelectorModule(
  namespace: string,
  existingModules: StringIndexObject
): StringIndexObject {
  return dissoc(namespace, existingModules);
}

function createSelectors(
  modules: StringIndexObject,
  getSelector: GetSelectorFunc
): StringIndexObject {
  let selectorMap: StringIndexObject = {};

  const createSelectorMap = (
    defFunc: SelectorsDefinition<any>,
    namespacePathArray: string[]
  ): StringIndexObject => {
    const map = defFunc({
      getSelector,
      ...Reselect
    });
    forEachObjIndexed((selector, key) => {
      if (selectorMap[key] != null) {
        console.warn(
          `[Redux-Balloon] Selector: ${key} has already been defined! ` +
            `Namespace: ${restoreNamespace(namespacePathArray)}`
        );
      }
      map[key] = function (state: any, ...args: any[]) {
        state = path(namespacePathArray, state);
        return selector.call(this, state, ...args);
      };
      map[key].sourceFunName = selector.name;
      map[key].sourceFunArgLength = selector.length;
    }, map);
    selectorMap = { ...selectorMap, ...map };
    return map;
  };

  forEachObjIndexed(m => {
    const [selectorDefFunc, namespacePathArray] = m;
    createSelectorMap(selectorDefFunc, namespacePathArray);
  }, modules);

  return selectorMap;
}

export { addSelectorModule, delSelectorModule, createSelectors };
