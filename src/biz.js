import { updateReducerModules, createReducers } from './reducerModules';
import { updateActionModules, createActions } from './actionModules';
import { updateSelectorModules, createSelectors } from './selectorModules';
import {
  updateSagaModules,
  createSagaMiddleware,
  runSagaModules
} from './sagaModules';
import createStore from './createStore';
import { warning } from './utils';
import { Status } from './constants';

export default function () {
  let status = Status.IDLE;
  let reducerModules;
  let reducers;
  let actionModules;
  let actions;
  let selectorModules;
  let selectors;
  let sagaModules;
  let sagaMiddleware;
  let store;

  function model(model) {
    if (status === Status.IDLE) {
      reducerModules = updateReducerModules(model, reducerModules);
      actionModules = updateActionModules(model, actionModules);
      selectorModules = updateSelectorModules(model, selectorModules);
      sagaModules = updateSagaModules(model, sagaModules);

      return this;
    } else {
      warning(`only add model in [status === 'IDLE'], but there is ${this.status}`);
    }
  }

  function run(options) {
    if (this.status === Status.IDLE) {
      reducers = createReducers(reducerModules);
      actions = createActions(actionModules);
      selectors = createSelectors(selectorModules);
      sagaMiddleware = createSagaMiddleware();

      let {middlewares = []} = options;
      middlewares.push(sagaMiddleware);

      store = createStore({
        ...options,
        reducers,
        middlewares
      });

      runSagaModules(
        sagaModules,
        sagaMiddleware,
        {
          actions,
          selectors
        }
      );

      status = Status.RUNNING;
    } else {
      warning(`only run() in [status === 'IDLE'], but there is ${this.status}`);
    }
  }

  function getStore() {
    return store;
  }

  function getActions() {
    return actions;
  }

  function getSelectors() {
    return selectors;
  }

  return {
    model,
    run,
    getStore,
    getActions,
    getSelectors
  };
}
