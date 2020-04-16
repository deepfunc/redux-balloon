import { ActionCreator } from 'redux';
import { ActionFunctionAny, ActionMeta, Action } from 'redux-actions';
import { NonNullableAndRequiredProperties } from './utils';

export type { Action, ActionCreator };

export type PayloadCreator<Payload> = ActionFunctionAny<Payload>;

export type MetaCreator<Meta> = ActionFunctionAny<Meta>;

export type ActionDefinitionTuple<Payload, Meta> = [
  string,
  (PayloadCreator<Payload> | null | undefined)?,
  (MetaCreator<Meta> | null | undefined)?
];

export interface MetaOfApiAction {
  isApi: true;
  isLatest?: boolean;
}

export type PayLoadOfAction<Action extends { payload: any }> = Action['payload'];

export type MetaOfAction<Action extends { meta: any }> = Action['meta'];

export type ApiAction<Payload> = ActionMeta<Payload, MetaOfApiAction>;

export interface MetaOfPromiseAction {
  isPromise: true;
}

export type PromiseAction<Payload> = ActionMeta<Payload, MetaOfPromiseAction>;

export type DefApiActionFunc = <Payload, Meta>(actDef: string | ActionDefinitionTuple<Payload, Meta>, isLatest?: boolean) => NonNullableAndRequiredProperties<ActionDefinitionTuple<Payload, MetaOfApiAction>>;

export type DefPromiseActionFunc = <Payload, Meta>(actDef: string | ActionDefinitionTuple<Payload, Meta>) => NonNullableAndRequiredProperties<ActionDefinitionTuple<Payload, MetaOfPromiseAction>>;

export interface ActionDefiner {
  defApiAction: DefApiActionFunc;
  defPromiseAction: DefPromiseActionFunc;
}

export type ActionsDefinitionMapObject<Actions> = {
  [P in keyof Actions]: string | ActionDefinitionTuple<any, any>;
}

export type ActionsDefinitionFunc<Actions> = (
  actionDefiner: ActionDefiner
) => ActionsDefinitionMapObject<Actions>;

export type GetActionFunc = <Actions extends {}, Action>(
  selectorName: keyof Actions
) => ActionFunctionAny<Action>;
