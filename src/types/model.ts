import { ActionCreatorsMapObject, ActionsDefinition } from './actions';
import { ReducersDefinition } from './reducers';
import { SelectorsMapObject, SelectorsDefinition } from './selectors';
import { SagasDefinition } from './sagas';

export interface Model<
  State = any,
  Actions extends ActionCreatorsMapObject = ActionCreatorsMapObject,
  Selectors extends SelectorsMapObject = SelectorsMapObject
> {
  namespace: string;
  state?: State;
  actions?: ActionsDefinition<Actions>;
  reducers?: ReducersDefinition<State, Actions>;
  selectors?: SelectorsDefinition<Selectors>;
  sagas?: SagasDefinition;
  workflow?: SagasDefinition;
}
