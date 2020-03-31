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
import { StringIndexObject } from './types';

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

export {
  addSagaModule,
  delSagaModule,
  createSagaMiddleware,
  // runSagaModules
};
