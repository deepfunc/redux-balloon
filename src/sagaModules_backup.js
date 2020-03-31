import { createSagaMiddleware, ReduxSaga } from './sagaImports_backup';
import SagaError from './SagaError_backup';
import {
  assoc,
  dissoc,
  forEachObjIndexed,
  isFunction,
  isArray,
  getTypeOfCancelSaga,
  noop
} from './utils';

const sagaEffects = ReduxSaga.effects;

function addSagaModule(model, existingModules) {
  const { namespace } = model;
  const sagas = model['workflow'] || model['sagas'];
  if (typeof sagas === 'undefined') {
    return existingModules;
  }

  return assoc(namespace, [sagas], existingModules);
}

function delSagaModule(namespace, existingModules) {
  return dissoc(namespace, existingModules);
}

function runSagaModules(modules, runSaga, opts, extras) {
  const { onSagaError = noop } = opts;
  const _extras = { ...extras, ReduxSaga };
  forEachObjIndexed((mod, namespace) => {
    const sagas = mod[0];
    const saga = createSaga(sagas, namespace, opts, _extras);
    runSaga(saga).toPromise().catch(err => {
      if (!(err instanceof SagaError)) {
        err = new SagaError(err, { namespace });
      }
      onSagaError(err);
    });
  }, modules);
}

function createSaga(sagas, namespace, opts, extras) {
  const { fork, take, cancel } = sagaEffects;

  return function* () {
    const watcher = createWatcher(sagas, namespace, opts, extras);
    const task = yield fork(watcher);

    yield take(getTypeOfCancelSaga(namespace));
    yield cancel(task);
  };
}

function createWatcher(sagas, namespace, opts, extras) {
  let sagasObj;
  let needInject = true;

  if (isFunction(sagas)) {
    sagasObj = sagas(sagaEffects, extras);
    if (isFunction(sagasObj)) {
      return sagasObj;
    } else {
      needInject = false;
    }
  } else {
    sagasObj = sagas;
  }

  return function* () {
    const typeWhiteList = [
      'takeEvery',
      'takeLatest',
      'takeLeading',
      'throttle',
      'debounce'
    ];
    const keys = Object.keys(sagasObj);

    for (const key of keys) {
      // takeEvery is default
      let type = 'takeEvery';
      let saga = sagasObj[key];
      let opts;

      if (isArray(saga)) {
        saga = sagasObj[key][0];
        opts = sagasObj[key][1];
        type = opts.type;

        if (!typeWhiteList.includes(type)) {
          throw new Error(
            `only support these types: [${typeWhiteList}], but got: ${type}. namespace: ${namespace}, key: ${key}`
          );
        }
      }
      const handler = handleActionForHelper(
        saga,
        { namespace, key, needInject },
        opts,
        extras
      );

      switch (type) {
        case 'throttle':
        case 'debounce':
          yield sagaEffects[type](opts.ms, key, handler);
          break;
        default:
          // takeEvery, takeLatest, takeLeading
          yield sagaEffects[type](key, handler);
      }
    }
  };
}

function handleActionForHelper(saga, { namespace, key, needInject }, opts, extras) {
  const { call } = sagaEffects;
  const injections = needInject ? [sagaEffects, extras] : [];

  return function* (action) {
    try {
      const ret = yield call(saga, action, ...injections);
      const { _resolve } = action;
      if (typeof _resolve === 'function') {
        _resolve(ret);
      }
    } catch (err) {
      const { _reject } = action;
      if (typeof _reject === 'function') {
        _reject(err);
      }
      throw new SagaError(err, { namespace, key });
    }
  };
}

export {
  addSagaModule,
  delSagaModule,
  createSagaMiddleware,
  runSagaModules
};
