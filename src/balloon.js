import { any, filter } from 'ramda';
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
import { warning, isProdENV, getTypeOfCancelSaga } from './utils';
import { Status } from './constants';

export default function () {
  let reducerModules = {};
  let reducers;
  let actionModules = {};
  let actions;
  let selectorModules = {};
  let selectors;
  let sagaModules;
  let sagaMiddleware;

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
      runSagaModules(
        {[model.namespace]: sagaModules[model.namespace]},
        sagaMiddleware,
        {
          actions: app.actions,
          selectors: app.selectors
        }
      );
    }

    return app;
  }

  function updateInjectedArgs() {
    reducers = createReducers(reducerModules);
    actions = createActions(actionModules);
    selectors = createSelectors(selectorModules);
  }

  function unmodel(namespace) {
    invariant(
      !any(model => model.namespace === namespace)(app.models),
      `[app.models] don't has this namespace: ${namespace}`
    );

    reducerModules = delReducerModule(namespace, reducerModules);
    actionModules = delActionModule(namespace, actionModules);
    selectorModules = delSelectorModule(namespace, selectorModules);
    sagaModules = delSagaModule(namespace, sagaModules);
    updateInjectedArgs();
    app.store.replaceReducer(reducers);
    app.store.dispatch({type: getTypeOfCancelSaga(namespace)});
    app.models = filter(model => model.namespace !== namespace)(app.models);
  }

  function run(opts) {
    if (app.status === Status.IDLE) {
      updateInjectedArgs();
      sagaMiddleware = createSagaMiddleware();
      let {middlewares = []} = opts;
      middlewares.push(sagaMiddleware);

      app.store = createStore({
        ...opts,
        reducers,
        middlewares
      });

      runSagaModules(
        sagaModules,
        sagaMiddleware,
        {
          actions: app.actions,
          selectors: app.selectors
        }
      );

      app.status = Status.RUNNING;
    } else {
      warning(`only run() in [app.status === 'IDLE'], but there is ${app.status}`);
    }
  }
}
