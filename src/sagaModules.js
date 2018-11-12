import invariant from 'invariant';
import { assoc, dissoc, forEachObjIndexed } from 'ramda';
import createSagaMiddleware, * as ReduxSaga from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import {
  takeEveryHelper,
  takeLatestHelper,
  throttleHelper
} from 'redux-saga/lib/internal/sagaHelpers';
import {
  isPlainObject,
  isFunction,
  isArray,
  getTypeOfCancelSaga,
  noop
} from './utils';

function addSagaModule(model, existingModules) {
  const {namespace, sagas} = model;
  if (typeof sagas === 'undefined') {
    return existingModules;
  }

  invariant(
    isPlainObject(sagas) || isFunction(sagas),
    `[model.sagas] should be plain object or function, but got ${typeof sagas}`
  );

  return assoc(namespace, [sagas], existingModules);
}

function delSagaModule(namespace, existingModules) {
  return dissoc(namespace, existingModules);
}

function runSagaModules(modules, sagaMiddleware, opts, extras) {
  const {onSagaError = noop} = opts;
  const _extras = {...extras, ReduxSaga};
  forEachObjIndexed((module, namespace) => {
    const sagas = module[0];
    const saga = createSaga(sagas, namespace, opts, _extras);
    sagaMiddleware
      .run(saga)
      .done
      .catch(e => onSagaError(e, {namespace}));
  }, modules);
}

function createSaga(sagas, namespace, opts, extras) {
  const {fork, take, cancel} = sagaEffects;

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
    const keys = Object.keys(sagasObj);

    for (const key of keys) {
      let type = 'takeEvery';
      let ms;
      let saga = sagasObj[key];

      if (isArray(saga)) {
        saga = sagasObj[key][0];
        const opts = sagasObj[key][1];
        type = opts.type;

        if (type === 'throttle') {
          ms = opts.ms;
        }
      }
      const handler = handleActionForHelper(
        saga,
        {namespace, key, needInject},
        opts,
        extras
      );

      switch (type) {
        case 'takeLatest':
          yield takeLatestHelper(key, handler);
          break;
        case 'throttle':
          yield throttleHelper(ms, key, handler);
          break;
        default:
          yield takeEveryHelper(key, handler);
      }
    }
  };
}

function handleActionForHelper(saga, {namespace, key, needInject}, opts, extras) {
  const {call} = sagaEffects;
  const {onSagaError = noop} = opts;
  const injections = needInject ? [sagaEffects, extras] : [];

  return function* (action) {
    try {
      yield call(saga, action, ...injections);
    } catch (e) {
      onSagaError(e, {namespace, key});
    }
  };
}

export {
  addSagaModule,
  delSagaModule,
  createSagaMiddleware,
  runSagaModules
};
