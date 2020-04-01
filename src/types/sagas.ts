import { AnyAction } from 'redux';
import * as ReduxSaga from 'redux-saga';
import * as SagaEffects from 'redux-saga/effects';
import { GetSelectorFunc } from './selectors';
import { GetActionFunc } from './actions';

export type SagaErrorType = Error & {
  sourceErr: Error;
  detail?: {};
};

export type Saga<Args extends any[] = any[]> = (...args: Args) => Generator<any>;

export type SagaHelperFuncName =
  'takeEvery' | 'takeLatest' | 'takeLeading' | 'throttle' | 'debounce';

export type SagaFunc = (
  action: AnyAction,
  effects: typeof SagaEffects,
  extras: typeof ReduxSaga & { getSelector: GetSelectorFunc; getAction: GetActionFunc; }
) => IterableIterator<any>;

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

export type SimpleSagaFunc = (action: AnyAction) => Generator<any>;

export type SimpleSagaFuncTuple = [
  SimpleSagaFunc,
  {
    type: SagaHelperFuncName;
    [key: string]: any;
  }
];

export interface SimpleSagasDefinitionMapObject {
  [sagaName: string]: SimpleSagaFunc | SimpleSagaFuncTuple;
}

export type SimpleSagasDefinitionFunc = (
  effects: typeof SagaEffects,
  extras: typeof ReduxSaga & { getSelector: GetSelectorFunc; getAction: GetActionFunc; }
) => SimpleSagasDefinitionMapObject;

export type ManualSagasDefinitionFunc = (
  effects: typeof SagaEffects,
  extras: typeof ReduxSaga & { getSelector: GetSelectorFunc; getAction: GetActionFunc; }
) => Generator<any>;

export type SagasDefinition =
  SagasDefinitionMapObject | SimpleSagasDefinitionFunc | ManualSagasDefinitionFunc;
