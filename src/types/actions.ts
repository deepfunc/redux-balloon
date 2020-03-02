import { ActionFunction1 } from 'redux-actions';

export type ActionType = string;

export type ActionDefinitionTuple<Payload, Meta> = [
  ActionType,
];

export interface ActionsMapObject {
  [key: string]: ActionType
}
