import * as Reselect from 'reselect';
import {
  assocPath,
  dissocPath,
  pathOfNS,
  mapObjIndexed,
  isArray
} from './utils';

function addSelectorModule(model, existingModules) {
  const { namespace, selectors } = model;
  if (typeof selectors === 'undefined') {
    return existingModules;
  }

  return assocPath(pathOfNS(namespace), [selectors], existingModules);
}

function delSelectorModule(namespace, existingModules) {
  return dissocPath(pathOfNS(namespace), existingModules);
}

function createSelectors(modules, getSelector) {
  let selectors;
  let selectorMap = {};

  const createSelectorMap = (defFunc) => {
    const map = defFunc({
      getSelector,
      ...Reselect
    });
    selectorMap = { ...selectorMap, ...map };
    return map;
  };

  const create = (modules) => {
    if (isArray(modules)) {
      const [selectorDefFunc] = modules;
      return createSelectorMap(selectorDefFunc);
    }

    return mapObjIndexed(mod => create(mod), modules);
  };

  selectors = { ...create(modules), ...selectorMap };
  return selectors;
}

export {
  addSelectorModule,
  delSelectorModule,
  createSelectors
};
