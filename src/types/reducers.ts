import { ReduxCompatibleReducerMeta } from 'redux-actions';
import { ActionCreatorsMapObject } from './actions';

export interface CreateReducersOptions {
  onEnhanceReducer?: EnhanceReducerFunc;
}

export type EnhanceReducerFunc = <State, Payload, Meta>(
  reducer: ReduxCompatibleReducerMeta<State, Payload, Meta>,
  namespace: string
) => ReduxCompatibleReducerMeta<State, Payload, Meta>;

export type ReducersDefinition<
  State,
  Actions = unknown
> = (Actions extends ActionCreatorsMapObject
  ? {
      [P in keyof Actions]?: Actions[P] extends (...args: any[]) => infer R
        ? (state: State, action: R) => State
        : never;
    }
  : {}) & { [actionType: string]: (state: State, action: any) => State };
