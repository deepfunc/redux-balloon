import invariant from 'invariant';
import checkModel from './checkModel';
import { addReducerModule, delReducerModule, createReducers } from './reducerModules';
import { addActionModule, delActionModule, createActions } from './actionModules';
import { addSelectorModule, delSelectorModule, createSelectors } from './selectorModules';
import {
  addSagaModule,
  delSagaModule,
  createSagaMiddleware,
  runSagaModules
} from './sagaModules';
import createStore from './createStore';
import {
  any,
  filter,
  lazyInvoker,
  warning,
  isProdENV,
  getTypeOfCancelSaga
} from './utils';
import { Status } from './constants';

export default function () {
  let reducerModules = {};
  let reducers;
  let actionModules = {};
  let actions;
  let selectorModules = {};
  let selectors;
  let sagaModules = {};
  let sagaMiddleware;
  let runOpts;

  const app = {
    status: Status.IDLE,
    models: [],
    model,
    unmodel,
    run,
    get actions() {
      return actions;
    },
    get selectors() {
      return selectors;
    }
  };

  return app;

  function model(model) {
    if (!isProdENV()) {
      checkModel(model, app.models);
    }

    reducerModules = addReducerModule(model, reducerModules);
    actionModules = addActionModule(model, actionModules);
    selectorModules = addSelectorModule(model, selectorModules);
    sagaModules = addSagaModule(model, sagaModules);
    app.models.push(model);

    if (app.status === Status.RUNNING) {
      updateInjectedArgs();
      app.store.replaceReducer(reducers);
      const { namespace } = model;
      const newSaga = sagaModules[namespace];
      if (newSaga) {
        runSagaModules(
          { [namespace]: newSaga },
          sagaMiddleware.run,
          runOpts,
          {
            actions: app.actions,
            selectors: app.selectors
          }
        );
      }
    }

    return app;
  }

  function getAction(key) {
    return lazyInvoker(() => actions, key);
  }

  function getSelector(key) {
    return lazyInvoker(() => selectors, key);
  }

  function updateInjectedArgs() {
    reducers = createReducers(reducerModules, runOpts);
    actions = createActions(actionModules);
    selectors = createSelectors(selectorModules, getSelector);
  }

  function unmodel(namespace) {
    invariant(
      any(model => model.namespace === namespace, app.models),
      `[app.models] don't has this namespace: ${namespace}`
    );

    reducerModules = delReducerModule(namespace, reducerModules);
    actionModules = delActionModule(namespace, actionModules);
    selectorModules = delSelectorModule(namespace, selectorModules);
    sagaModules = delSagaModule(namespace, sagaModules);

    if (app.status === Status.RUNNING) {
      updateInjectedArgs();
      app.store.replaceReducer(reducers);
      app.store.dispatch({ type: getTypeOfCancelSaga(namespace) });
    }

    app.models = filter(model => model.namespace !== namespace, app.models);
  }

  function run(opts = {}) {
    if (app.status === Status.IDLE) {
      runOpts = opts;
      updateInjectedArgs();
      sagaMiddleware = createSagaMiddleware();
      let { middlewares = [] } = runOpts;
      middlewares.push(sagaMiddleware);

      app.store = createStore({
        ...runOpts,
        reducers,
        middlewares
      });

      runSagaModules(
        sagaModules,
        sagaMiddleware.run,
        runOpts,
        { getAction, getSelector }
      );

      app.status = Status.RUNNING;
    } else {
      warning(`only run() in [app.status === 'IDLE'], but there is ${app.status}`);
    }
  }
}
