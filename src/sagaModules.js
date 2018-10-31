import invariant from 'invariant';
import { merge, forEachObjIndexed } from 'ramda';
import createSagaMiddleware, * as ReduxSaga from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import {
  takeEveryHelper,
  takeLatestHelper,
  throttleHelper
} from 'redux-saga/lib/internal/sagaHelpers';
import { isPlainObject, isFunction, isArray } from './utils';

function updateSagaModules(model, modules = {}) {
  const {namespace, sagas} = model;
  if (typeof sagas === 'undefined') {
    return modules;
  }

  invariant(
    isPlainObject(sagas) || isFunction(sagas),
    `[model.sagas] should be plain object or function, but got ${typeof sagas}`
  );

  return merge(modules, {[namespace]: [sagas]});
}

function runSagaModules(modules, sagaMiddleware, extras) {
  const _extras = {...extras, ReduxSaga};
  forEachObjIndexed((module, namespace) => {
    const sagas = module[0];
    const saga = createSaga(sagas, namespace, _extras);
    sagaMiddleware.run(saga);
  }, modules);
}

function createSaga(sagas, namespace, extras) {
  const {fork, take, cancel} = sagaEffects;

  return function* () {
    const watcher = createWatcher(sagas, extras);
    const task = yield fork(watcher);

    yield take(`${namespace}/@@CANCEL_SAGA`);
    yield cancel(task);
  };
}

function createWatcher(sagas, extras) {
  if (isFunction(sagas)) {
    return sagas(sagaEffects, extras);
  } else {
    return function* () {
      const keys = Object.keys(sagas);

      for (const key of keys) {
        let type = 'takeEvery';
        let ms;
        let saga = sagas[key];

        if (isArray(saga)) {
          saga = sagas[key][0];
          const opts = sagas[key][1];
          type = opts.type;

          if (type === 'throttle') {
            ms = opts.ms;
          }
        }
        const handler = handleActionForHelper(saga, extras);

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
}

function handleActionForHelper(saga, extras) {
  const {call} = sagaEffects;

  return function* (action) {
    yield call(saga, action, sagaEffects, extras);
  };
}

export {
  updateSagaModules,
  createSagaMiddleware,
  runSagaModules
};
