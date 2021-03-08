import invariant from 'invariant';
import { Reducer } from 'redux';
import checkModel from './checkModel';
import { createReducers } from './reducerModules';
import {
  addActionModule,
  delActionModule,
  createActions
} from './actionModules';
import {
  addSelectorModule,
  delSelectorModule,
  createSelectors
} from './selectorModules';
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
import { mergeApiMap } from './models/api/apiMap';
import { Biz, BizRunOptions } from './types/balloon';
import { StringIndexObject } from './types/utils';
import { Model } from './types/model';
import { ActionKey, ActionFuncType } from './types/actions';
import { SelectorKey, SelectorFuncType } from './types/selectors';

export default function (): Biz {
  let models: Model[] = [];
  let reducers: Reducer;
  let actionModules: StringIndexObject = {};
  let actions: StringIndexObject;
  let selectorModules: StringIndexObject = {};
  let selectors: StringIndexObject;
  let sagaModules: StringIndexObject = {};
  let sagaMiddleware: any;
  let runOpts: BizRunOptions;

  function model(model: Model): Biz {
    if (!isProdENV()) {
      checkModel(model, models);
    }

    actionModules = addActionModule(model, actionModules);
    selectorModules = addSelectorModule(model, selectorModules);
    sagaModules = addSagaModule(model, sagaModules);
    models.push(model);

    if (biz.status === BizStatus.RUNNING) {
      updateInjectedArgs();
      biz.store!.replaceReducer(reducers);
      const { namespace } = model;
      const newSaga = sagaModules[namespace];
      if (newSaga) {
        runSagaModules({ [namespace]: newSaga }, sagaMiddleware.run, runOpts, {
          getAction,
          getSelector
        });
      }
    }

    return biz;
  }

  function addModels(models: Model[]): Biz {
    for (const m of models) {
      model(m);
    }

    return biz;
  }

  function getAction<M extends Model, K extends ActionKey<M>>(
    model: M,
    key: K
  ): ActionFuncType<M, K>;
  function getAction(key: string): any;
  function getAction(...args: any[]): any {
    let key: string;

    if (args.length === 1) {
      key = args[0];
    } else {
      key = args[1];
    }
    return lazyInvoker(() => actions, key);
  }

  function getSelector<M extends Model, K extends SelectorKey<M>>(
    model: M,
    key: K
  ): SelectorFuncType<M, K>;
  function getSelector(key: string): any;
  function getSelector(...args: any[]): any {
    let key: string;

    if (args.length === 1) {
      key = args[0];
    } else {
      key = args[1];
    }
    return lazyInvoker(() => selectors, key);
  }

  function updateInjectedArgs(): void {
    reducers = createReducers(models, runOpts);
    actions = createActions(actionModules);
    selectors = createSelectors(selectorModules, getSelector);
  }

  function unmodel(namespace: string): void {
    invariant(
      any(model => model.namespace === namespace, models),
      `[app.models] don't has this namespace: ${namespace}`
    );

    actionModules = delActionModule(namespace, actionModules);
    selectorModules = delSelectorModule(namespace, selectorModules);
    sagaModules = delSagaModule(namespace, sagaModules);
    models = filter(model => model.namespace !== namespace, models);

    if (biz.status === BizStatus.RUNNING) {
      updateInjectedArgs();
      biz.store!.replaceReducer(reducers);
      biz.store!.dispatch({ type: getTypeOfCancelSaga(namespace) });
    }
  }

  function getModel(namespace: string): Model | undefined {
    return models.find(m => m.namespace === namespace);
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

      runSagaModules(sagaModules, sagaMiddleware.run, runOpts, {
        getAction,
        getSelector
      });

      biz.status = BizStatus.RUNNING;
    } else {
      warning(
        `only run() in [app.status === 'IDLE'], but there is ${biz.status}`
      );
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

  const biz: Biz = {
    status: BizStatus.IDLE,
    model,
    addModels,
    unmodel,
    getModel,
    run,
    get actions() {
      return actions;
    },
    getAction,
    get selectors() {
      return selectors;
    },
    getSelector,
    mergeApiMap
  };

  return biz;
}
