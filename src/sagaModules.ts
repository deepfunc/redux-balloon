import { AnyAction } from 'redux';
import { createSagaMiddleware, ReduxSaga } from './sagaImports';
import SagaError from './SagaError';
import {
  assoc,
  dissoc,
  forEachObjIndexed,
  isFunction,
  isArray,
  getTypeOfCancelSaga,
  noop
} from './utils';
import {
  Saga,
  SagasDefinition,
  StringIndexObject
} from './types';

const sagaEffects = ReduxSaga.effects;

function addSagaModule(
  model: any,
  existingModules: StringIndexObject
): StringIndexObject {
  const { namespace } = model;
  const sagas = model.workflow || model.sagas;
  if (typeof sagas === 'undefined') {
    return existingModules;
  }

  return assoc(namespace, [sagas], existingModules);
}

function delSagaModule(
  namespace: string,
  existingModules: StringIndexObject
): StringIndexObject {
  return dissoc(namespace, existingModules);
}

function runSagaModules(
  modules: StringIndexObject,
  runSaga: any,
  opts: any,
  extras: any
): void {
  const { onSagaError = noop } = opts;
  const _extras = { ...extras, ReduxSaga };

  forEachObjIndexed((mod, namespace) => {
    const sagas = mod[0];
    const saga = createSaga(sagas, namespace, opts, _extras);
    runSaga(saga).toPromise().catch((err: Error) => {
      if (!(err instanceof SagaError)) {
        err = new SagaError(err, { namespace });
      }
      onSagaError(err);
    });
  }, modules);
}

function createSaga(
  sagas: SagasDefinition,
  namespace: string,
  opts: any,
  extras: any
): () => Generator<any> {
  const { fork, take, cancel } = sagaEffects;

  return function* () {
    const watcher = createWatcher(sagas, namespace, opts, extras);
    const task = yield fork(watcher);

    yield take(getTypeOfCancelSaga(namespace));
    yield cancel(task as any);
  };
}

function createWatcher(
  sagas: SagasDefinition,
  namespace: string,
  opts: any,
  extras: any
): () => Generator<any> {
  let sagasObj: any;
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
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `only support these types: [${typeWhiteList}], but got: ${type}. namespace: ${namespace}, key: ${key}`
          );
        }
      }
      const handler = handleActionForHelper(
        saga,
        { namespace, key, needInject },
        extras
      );

      switch (type) {
        case 'throttle':
        case 'debounce':
          yield (sagaEffects as any)[type](opts.ms, key, handler);
          break;
        default:
          // takeEvery, takeLatest, takeLeading
          yield (sagaEffects as any)[type](key, handler);
      }
    }
  };
}

function handleActionForHelper(
  saga: Saga,
  { namespace, key, needInject }: any,
  extras: any
): Saga {
  const { call } = sagaEffects;
  const injections = needInject ? [sagaEffects, extras] : [];

  return function* (action: AnyAction) {
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
