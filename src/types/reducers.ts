import { ReducerMeta, ReduxCompatibleReducerMeta } from 'redux-actions';

export interface ReducersDefinitionMapObject<State, Payload, Meta> {
  [actionType: string]: ReducerMeta<State, Payload, Meta>;
}

export interface CreateReducersOptions {
  onEnhanceReducer?: EnhanceReducerFunc;
}

export type EnhanceReducerFunc =
  <State, Payload, Meta>(
    reducer: ReduxCompatibleReducerMeta<State, Payload, Meta>,
    namespace: string
  ) => ReduxCompatibleReducerMeta<State, Payload, Meta>;
