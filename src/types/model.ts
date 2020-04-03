import {
  ActionsDefinitionMapObject,
  ActionsDefinitionFunc
} from './actions';
import { ReducersDefinitionMapObject } from './reducers';
import { SelectorsDefinitionFunc } from './selectors';
import { SagasDefinition } from './sagas';

/**
 * @template State The type of state.
 * @template Selectors The type of selectors.
 */
export interface Model<State, Selectors> {
  namespace: string;
  state?: State;
  actions?: ActionsDefinitionMapObject | ActionsDefinitionFunc;
  reducers?: ReducersDefinitionMapObject<State, any, any>;
  selectors?: SelectorsDefinitionFunc<Selectors>;
  sagas?: SagasDefinition;
  workflow?: SagasDefinition;
}
