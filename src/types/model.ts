import {
  ActionsDefinitionMapObject,
  ActionsDefinitionFunc
} from './actions';
import { ReducersDefinitionMapObject } from './reducers';
import { SelectorsDefinitionFunc } from './selectors';
import { SagasDefinition } from './sagas';

/**
 * @template State The type of state.
 * @template Actions The type of actions.
 * @template Selectors The type of selectors.
 */
export interface Model<State, Actions, Selectors> {
  namespace: string;
  state?: State;
  actions?: ActionsDefinitionMapObject<Actions> | ActionsDefinitionFunc<Actions>;
  reducers?: ReducersDefinitionMapObject<State>;
  selectors?: SelectorsDefinitionFunc<Selectors, State>;
  sagas?: SagasDefinition;
  workflow?: SagasDefinition;
}
