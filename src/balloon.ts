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
import { Biz, BizRunOptions } from './types/balloon';
import { Reducer } from 'redux';
import { StringIndexObject } from './types/utils';
import { Model } from './types/model';
import { SelectorFunctionAny } from './types/selectors';
import { ActionFunctionAny } from 'redux-actions';

export default function (): Biz {
  let reducers: Reducer;
  let actionModules: StringIndexObject = {};
  let actions: StringIndexObject;
  let selectorModules: StringIndexObject = {};
  let selectors: StringIndexObject;
  let sagaModules: StringIndexObject = {};
  let sagaMiddleware: any;
  let runOpts: BizRunOptions;

  const biz: Biz = {
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

  function model<State, Selectors>(model: Model<State, Selectors>): Biz {
    if (!isProdENV()) {
      checkModel(model, biz.models);
    }

    actionModules = addActionModule(model, actionModules);
    selectorModules = addSelectorModule(model, selectorModules);
    sagaModules = addSagaModule(model, sagaModules);
    biz.models.push(model);

    if (biz.status === BizStatus.RUNNING) {
      updateInjectedArgs();
      biz.store!.replaceReducer(reducers);
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

  function getAction<Actions>(key: keyof Actions): ActionFunctionAny<any> {
    return lazyInvoker(() => actions, key as string);
  }

  function getSelector<Selectors>(key: keyof Selectors): SelectorFunctionAny {
    return lazyInvoker(() => selectors, key as string);
  }

  function updateInjectedArgs(): void {
    reducers = createReducers(biz.models, runOpts);
    actions = createActions(actionModules);
    selectors = createSelectors(selectorModules, getSelector);
  }

  function unmodel(namespace: string): void {
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
      biz.store!.replaceReducer(reducers);
      biz.store!.dispatch({ type: getTypeOfCancelSaga(namespace) });
    }
  }

  function run(opts: BizRunOptions = {}): void {
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

  function initBuiltInModel(opts: BizRunOptions): BizRunOptions {
    const rst = { ...opts };
    if (isPlainObject(opts.apiModel)) {
      biz.model(createApiModel(opts.apiModel));
      rst.usePromiseMiddleware = true;
    }
    return rst;
  }

  function initMiddlewares(opts: BizRunOptions): any[] {
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
