import { ActionsDefinitionMapObject, ActionsDefinitionFunc } from './actions';
import { ReducersDefinitionMapObject } from './reducers';
import { SelectorsDefinition } from './selectors';
import { SagasDefinition } from './sagas';

export interface Model<
  State = any,
  Actions = any,
  Selectors extends SelectorsDefinition = SelectorsDefinition
> {
  namespace: string;
  state?: State;
  actions?:
    | ActionsDefinitionMapObject<Actions>
    | ActionsDefinitionFunc<Actions>;
  reducers?: ReducersDefinitionMapObject<State>;
  selectors?: Selectors;
  sagas?: SagasDefinition;
  workflow?: SagasDefinition;
}
