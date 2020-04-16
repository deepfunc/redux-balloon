import {
  ReduxCompatibleReducerMeta
} from 'redux-actions';

export interface ReducersDefinitionMapObject<State> {
  [actionType: string]: (state: State, action: any) => State;
}

export interface CreateReducersOptions {
  onEnhanceReducer?: EnhanceReducerFunc;
}

export type EnhanceReducerFunc =
  <State, Payload, Meta>(
    reducer: ReduxCompatibleReducerMeta<State, Payload, Meta>,
    namespace: string
  ) => ReduxCompatibleReducerMeta<State, Payload, Meta>;
