import invariant from 'invariant';
import { assocPath, map, merge, curry } from 'ramda';
import * as Reselect from 'reselect';
import { pathOfNS, isFunction, isArray, lazyInvoker } from './utils';

function updateSelectorModules(model, modules) {
  const {namespace, selectors} = model;
  if (typeof selectors === 'undefined') {
    return modules;
  }

  invariant(
    typeof isFunction(selectors),
    `[model.selectors] should be function, but got ${typeof selectors}`
  );

  return assocPath(pathOfNS(namespace), [selectors], modules);
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
    selectorMap = merge(selectorMap, map);
    return map;
  };

  const create = (modules) => {
    if (isArray(modules)) {
      const [selectorDefFunc] = modules;
      return createSelectorMap(selectorDefFunc);
    }

    return map((module) => create(module), modules);
  };

  selectors = merge(create(modules), selectorMap);
  return selectors;
}

export {
  updateSelectorModules,
  createSelectors
};
