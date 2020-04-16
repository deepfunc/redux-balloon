import * as ReduxSaga from 'redux-saga';
import * as SagaEffects from 'redux-saga/effects';
import { GetSelectorFunc } from './selectors';
import { GetActionFunc } from './actions';

export type SagaErrorType = Error & {
  sourceErr: Error;
  detail?: {};
};

export type Saga<Args extends any[] = any[]> = (...args: Args) => Generator<any, any, any>;

export type SagaHelperFuncName =
  'takeEvery' | 'takeLatest' | 'takeLeading' | 'throttle' | 'debounce';

export type SagaFunc = (
  action: any,
  effects: typeof SagaEffects,
  extras: typeof ReduxSaga & { getSelector: GetSelectorFunc; getAction: GetActionFunc }
) => Generator<any, any, any>;

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

export type SimpleSagaFunc = (action: any) => Generator<any, any, any>;

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
  extras: typeof ReduxSaga & { getSelector: GetSelectorFunc; getAction: GetActionFunc }
) => SimpleSagasDefinitionMapObject;

export type ManualSagasDefinitionFunc = (
  effects: typeof SagaEffects,
  extras: typeof ReduxSaga & { getSelector: GetSelectorFunc; getAction: GetActionFunc }
) => () => Generator<any, any, any>;

export type SagasDefinition =
  SagasDefinitionMapObject | SimpleSagasDefinitionFunc | ManualSagasDefinitionFunc;
