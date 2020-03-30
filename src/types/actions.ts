import { ActionFunctionAny, ActionMeta } from 'redux-actions';
import { NonNullableAndRequiredProperties } from './utils';

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

export interface ActionsDefinitionMapObject {
  [actionName: string]: string | ActionDefinitionTuple<any, any>;
}

export type ActionsDefinitionFunc = (actionDefiner: ActionDefiner) => ActionsDefinitionMapObject;
