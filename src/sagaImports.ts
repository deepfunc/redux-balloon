import * as ReduxSaga from 'redux-saga';
import * as effects from 'redux-saga/effects';

const SagaEffects = effects;
const createSagaMiddleware = ReduxSaga.default;
const reduxSagaExport = { ...ReduxSaga, effects: SagaEffects };

export {
  createSagaMiddleware,
  reduxSagaExport as ReduxSaga
};
