import invariant from 'invariant';
import checkModel from './checkModel';
import { createReducers } from './reducerModules';
import { addActionModule, delActionModule, createActions } from './actionModules';
import { addSelectorModule, delSelectorModule, createSelectors } from './selectorModules';
import {
  addSagaModule,
  delSagaModule,
  createSagaMiddleware,
  runSagaModules
} from './sagaModules';
import createStore from './createStore';
import promiseMiddleware from './promiseMiddleware';
import {
  identity,
  any,
  filter,
  lazyInvoker,
  warning,
  isProdENV,
  getTypeOfCancelSaga
} from './utils';
import { Status } from './constants';

export default function () {
  let reducers;
  let actionModules = {};
  let actions;
  let selectorModules = {};
  let selectors;
  let sagaModules = {};
  let sagaMiddleware;
  let runOpts;

  const biz = {
    status: Status.IDLE,
    models: [],
    model,
    unmodel,
    run,
    get actions() {
      return actions;
    },
    getAction,
    get selectors() {
      return selectors;
    },
    getSelector
  };

  return biz;

  function model(model) {
    if (!isProdENV()) {
      checkModel(model, biz.models);
    }

    actionModules = addActionModule(model, actionModules);
    selectorModules = addSelectorModule(model, selectorModules);
    sagaModules = addSagaModule(model, sagaModules);
    biz.models.push(model);

    if (biz.status === Status.RUNNING) {
      updateInjectedArgs();
      biz.store.replaceReducer(reducers);
      const { namespace } = model;
      const newSaga = sagaModules[namespace];
      if (newSaga) {
        runSagaModules(
          { [namespace]: newSaga },
          sagaMiddleware.run,
          runOpts,
          {
            actions: biz.actions,
            selectors: biz.selectors
          }
        );
      }
    }

    return biz;
  }

  function getAction(key) {
    return lazyInvoker(() => actions, key);
  }

  function getSelector(key) {
    return lazyInvoker(() => selectors, key);
  }

  function updateInjectedArgs() {
    reducers = createReducers(biz.models, runOpts);
    actions = createActions(actionModules);
    selectors = createSelectors(selectorModules, getSelector);
  }

  function unmodel(namespace) {
    invariant(
      any(model => model.namespace === namespace, biz.models),
      `[app.models] don't has this namespace: ${namespace}`
    );

    actionModules = delActionModule(namespace, actionModules);
    selectorModules = delSelectorModule(namespace, selectorModules);
    sagaModules = delSagaModule(namespace, sagaModules);

    if (biz.status === Status.RUNNING) {
      updateInjectedArgs();
      biz.store.replaceReducer(reducers);
      biz.store.dispatch({ type: getTypeOfCancelSaga(namespace) });
    }

    biz.models = filter(model => model.namespace !== namespace, biz.models);
  }

  function run(opts = {}) {
    if (biz.status === Status.IDLE) {
      runOpts = opts;
      runOpts.usePromiseMiddleware =
        runOpts.usePromiseMiddleware == null ? true : runOpts.usePromiseMiddleware;
      updateInjectedArgs();
      sagaMiddleware = createSagaMiddleware();
      let { middlewares = [], onEnhanceStore = identity } = runOpts;
      if (runOpts.usePromiseMiddleware) {
        middlewares.unshift(promiseMiddleware);
      }
      middlewares.push(sagaMiddleware);

      const store = createStore({
        ...runOpts,
        reducers,
        middlewares
      });
      biz.store = onEnhanceStore(store);
      Object.assign(biz, biz.store);

      runSagaModules(
        sagaModules,
        sagaMiddleware.run,
        runOpts,
        { getAction, getSelector }
      );

      biz.status = Status.RUNNING;
    } else {
      warning(`only run() in [app.status === 'IDLE'], but there is ${biz.status}`);
    }
  }
}
