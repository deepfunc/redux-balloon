import { ActionFunctionAny, ActionMeta } from 'redux-actions';

export type ActionType = string;

export type PayloadCreator<Payload> = ActionFunctionAny<Payload> | null;

export type MetaCreator<Meta> = ActionFunctionAny<Meta> | null;

export type ActionDefinitionTuple<Payload, Meta> = [
  ActionType,
  PayloadCreator<Payload>?,
  MetaCreator<Meta>?
];

export interface ActionDefinitionMapObject {
  [key: string]: ActionType | ActionDefinitionTuple<any, any>
}

export interface MetaOfApiAction {
  isApi: true
}

export type ApiAction<Payload> = ActionMeta<Payload, MetaOfApiAction>;


export interface MetaOfPromiseAction {
  isPromise: true
}

export type PromiseAction<Payload> = ActionMeta<Payload, MetaOfPromiseAction>;
