import invariant from 'invariant';
import { assocPath, map, mergeRight, curry, dissocPath } from 'ramda';
import * as Reselect from 'reselect';
import { pathOfNS, isFunction, isArray, lazyInvoker } from './utils';

function addSelectorModule(model, existingModules) {
  const { namespace, selectors } = model;
  if (typeof selectors === 'undefined') {
    return existingModules;
  }

  invariant(
    isFunction(selectors),
    `[model.selectors] should be function, but got ${typeof selectors}`
  );

  return assocPath(pathOfNS(namespace), [selectors], existingModules);
}

function delSelectorModule(namespace, existingModules) {
  return dissocPath(pathOfNS(namespace), existingModules);
}

function createSelectors(modules) {
  let selectors;
  let selectorMap = {};
  const getSelector = curry(lazyInvoker)(() => selectors);

  const createSelectorMap = (defFunc) => {
    const map = defFunc({
      getSelector,
      ...Reselect
    });
    selectorMap = mergeRight(selectorMap, map);
    return map;
  };

  const create = (modules) => {
    if (isArray(modules)) {
      const [selectorDefFunc] = modules;
      return createSelectorMap(selectorDefFunc);
    }

    return map((module) => create(module), modules);
  };

  selectors = mergeRight(create(modules), selectorMap);
  return selectors;
}

export {
  addSelectorModule,
  delSelectorModule,
  createSelectors
};
