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
import promiseMiddleware from './middlewares/promiseMiddleware';
import {
  identity,
  any,
  filter,
  lazyInvoker,
  warning,
  isProdENV,
  getTypeOfCancelSaga,
  isPlainObject
} from './utils';
import { BizStatus } from './constants';
import createApiModel from './models/api';

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
    status: BizStatus.IDLE,
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

    if (biz.status === BizStatus.RUNNING) {
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
    biz.models = filter(model => model.namespace !== namespace, biz.models);

    if (biz.status === BizStatus.RUNNING) {
      updateInjectedArgs();
      biz.store.replaceReducer(reducers);
      biz.store.dispatch({ type: getTypeOfCancelSaga(namespace) });
    }
  }

  function run(opts = {}) {
    if (biz.status === BizStatus.IDLE) {
      runOpts = opts;
      runOpts = initBuiltInModel(runOpts);
      updateInjectedArgs();
      const middlewares = initMiddlewares(runOpts);

      const { onEnhanceStore = identity } = runOpts;
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

      biz.status = BizStatus.RUNNING;
    } else {
      warning(`only run() in [app.status === 'IDLE'], but there is ${biz.status}`);
    }
  }

  function initBuiltInModel(opts) {
    let rst = { ...opts };
    if (isPlainObject(opts.apiModel)) {
      biz.model(createApiModel(opts.apiModel));
      rst.usePromiseMiddleware = true;
    }
    return rst;
  }

  function initMiddlewares(opts) {
    let middlewares = [];

    if (opts.usePromiseMiddleware) {
      middlewares.push(promiseMiddleware);
    }
    const { middlewares: middlewaresOpt = [] } = opts;
    middlewares = middlewares.concat(middlewaresOpt);
    sagaMiddleware = createSagaMiddleware();
    middlewares.push(sagaMiddleware);

    return middlewares;
  }
}
