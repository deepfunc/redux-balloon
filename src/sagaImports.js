import * as ReduxSaga from 'redux-saga';
import * as effects from 'redux-saga/effects';

const createSagaMiddleware = ReduxSaga.default;
const reduxSagaExport = { ...ReduxSaga, effects };

export {
  createSagaMiddleware,
  reduxSagaExport as ReduxSaga
};
