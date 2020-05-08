import * as Reselect from 'reselect';
import { Model } from './model';

export type ReselectObject = typeof Reselect;

export type SelectorsMapObject = {
  [key: string]: (...args: any[]) => any;
};

export type SelectorsDefinition<Selectors extends SelectorsMapObject> = (
  injected: ReselectObject & { getSelector: GetSelectorFunc }
) => SelectorsMapObject;

type SelectorsDefinitionReturnType<M> = M extends {
  selectors?: SelectorsDefinition<infer S>;
}
  ? S
  : never;

export type SelectorKey<M> = keyof SelectorsDefinitionReturnType<M>;

export type SelectorFuncType<
  M extends Model,
  K extends SelectorKey<M>
> = SelectorsDefinitionReturnType<M>[K];

type GetSelectorByModel = <M extends Model, K extends SelectorKey<M>>(
  model: M,
  key: K
) => SelectorFuncType<M, K>;

type GetSelector = (key: string) => (...args: any[]) => any;

export type GetSelectorFunc = GetSelectorByModel & GetSelector;
