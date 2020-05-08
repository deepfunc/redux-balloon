import { ActionCreator } from 'redux';
import { ActionFunctionAny, ActionMeta, Action } from 'redux-actions';
import { NonNullableAndRequiredProperties } from './utils';
import { Model } from './model';

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

export type PayLoadOfAction<
  Action extends { payload: any }
> = Action['payload'];

export type MetaOfAction<Action extends { meta: any }> = Action['meta'];

export type ApiAction<Payload> = ActionMeta<Payload, MetaOfApiAction>;

export interface MetaOfPromiseAction {
  isPromise: true;
}

export type PromiseAction<Payload> = ActionMeta<Payload, MetaOfPromiseAction>;

export type DefApiActionFunc = <Payload, Meta>(
  actDef: string | ActionDefinitionTuple<Payload, Meta>,
  isLatest?: boolean
) => NonNullableAndRequiredProperties<
  ActionDefinitionTuple<Payload, MetaOfApiAction>
>;

export type DefPromiseActionFunc = <Payload, Meta>(
  actDef: string | ActionDefinitionTuple<Payload, Meta>
) => NonNullableAndRequiredProperties<
  ActionDefinitionTuple<Payload, MetaOfPromiseAction>
>;

export interface ActionDefiner {
  defApiAction: DefApiActionFunc;
  defPromiseAction: DefPromiseActionFunc;
}

export type ActionsMapObject = {
  [key: string]: (...args: any[]) => any;
};

export type ActionsDefinitionMapObject<Actions extends ActionsMapObject> = {
  [P in keyof Actions]: string | ActionDefinitionTuple<any, any>;
};

export type ActionsDefinition<Actions extends ActionsMapObject> = (
  actionDefiner: ActionDefiner
) => ActionsDefinitionMapObject<Actions>;

export type ActionsDefinitionReturnType<M> = M extends {
  actions?: ActionsDefinition<infer S>;
}
  ? S
  : never;

export type ActionKey<M> = keyof ActionsDefinitionReturnType<M>;

export type ActionFuncType<
  M extends Model,
  K extends ActionKey<M>
> = ActionsDefinitionReturnType<M>[K];

type GetActionByModel = <M extends Model, K extends ActionKey<M>>(
  model: M,
  key: K
) => ActionFuncType<M, K>;

type GetAction = (key: string) => (...args: any[]) => any;

export type GetActionFunc = GetActionByModel & GetAction;
