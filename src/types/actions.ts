import { ActionFunctionAny, ActionMeta } from 'redux-actions';

export type ActionType = string;

export type PayloadCreator<Payload> = ActionFunctionAny<Payload>;

export type MetaCreator<Meta> = ActionFunctionAny<Meta>;

export type ActionDefinitionTuple<Payload, Meta> = [
  ActionType,
  (PayloadCreator<Payload> | null)?,
  (MetaCreator<Meta> | null)?
];

export type ActionDefinition<Payload, Meta> =
  ActionType | ActionDefinitionTuple<Payload, Meta>;

export interface ActionDefinitionMapObject {
  [key: string]: ActionDefinition<any, any>
}

export interface MetaOfApiAction {
  isApi: true,
  isLatest?: boolean
}

export type ApiAction<Payload> = ActionMeta<Payload, MetaOfApiAction>;


export interface MetaOfPromiseAction {
  isPromise: true
}

export type PromiseAction<Payload> = ActionMeta<Payload, MetaOfPromiseAction>;
