import { AnyAction } from 'redux';

export type SagaErrorType = Error & {
  sourceErr: Error;
  detail?: {};
};

export type SagaHelperFuncName =
  'takeEvery' | 'takeLatest' | 'takeLeading' | 'throttle' | 'debounce';

export type SagaFunc = (action: AnyAction) => IterableIterator<any>;

export type SagaFuncTuple = [
  SagaFunc,
  {
    type: SagaHelperFuncName;
    [key: string]: any;
  }
];

export interface SagasDefinitionMapObject {
  [sagaName: string]: SagaFunc | SagaFuncTuple;
}
