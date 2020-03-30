import {
  ActionsDefinitionMapObject,
  ActionsDefinitionFunc
} from './actions';
import { ReducersDefinitionMapObject } from './reducers';

/**
 * @template State The type of state.
 */
export interface Model<State> {
  namespace: string;
  state?: State;
  actions?: ActionsDefinitionMapObject | ActionsDefinitionFunc;
  reducers?: ReducersDefinitionMapObject<State, any, any>;
}
