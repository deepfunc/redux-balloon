import { ActionsMapObject, ActionsDefinition } from './actions';
import { ReducersDefinitionMapObject } from './reducers';
import { SelectorsDefinition } from './selectors';
import { SagasDefinition } from './sagas';

export interface Model<
  State = any,
  Actions extends ActionsMapObject = ActionsMapObject,
  Selectors extends SelectorsDefinition = SelectorsDefinition
> {
  namespace: string;
  state?: State;
  actions?: ActionsDefinition<Actions>;
  reducers?: ReducersDefinitionMapObject<State>;
  selectors?: Selectors;
  sagas?: SagasDefinition;
  workflow?: SagasDefinition;
}
