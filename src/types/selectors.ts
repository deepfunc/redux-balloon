import * as Reselect from 'reselect';
import { Model } from './model';

export type ReselectObject = typeof Reselect;

type SelectorsMapObject = {
  [key: string]: (...args: any[]) => any;
};

export type SelectorsDefinition = (
  injected: ReselectObject & { getSelector: GetSelectorFunc }
) => SelectorsMapObject;

export type SelectorKey<M> = M extends {
  selectors?: (...args: any[]) => infer S;
}
  ? keyof S
  : never;

type SelectorsDefinitionReturnType<S> = S extends (...args: any[]) => infer R
  ? R
  : any;

export type SelectorFuncType<
  M extends Model,
  K extends SelectorKey<M>
> = SelectorsDefinitionReturnType<Required<M>['selectors']>[K];

type GetSelectorByModel = <M extends Model, K extends SelectorKey<M>>(
  model: M,
  key: K
) => SelectorFuncType<M, K>;

type GetSelector = (key: string) => (...args: any[]) => any;

export type GetSelectorFunc = GetSelectorByModel & GetSelector;

// function getSelector<
//   M extends Model<any, any, SelectorsDefinition>,
//   K extends SelectorKey<M>
// >(model: M, key: K): SelectorFuncType<M, K>;
// function getSelector(...args: any[]): any {
//   return '123';
// }

// type UserState = {
//   userName: string;
//   userAge: number;
// };
//
// type UserSelectors = ({
//   createSelector
// }: ReselectObject) => {
//   getUsername: (state: UserState) => string;
//   getUserAge: (state: UserState) => number;
// };
//
// const userModel: Model<UserState, any, UserSelectors> = {
//   namespace: 'user',
//   state: { userName: 'Deep', userAge: 36 },
//   selectors: ({ createSelector }) => ({
//     getUsername: state => state.userName,
//     getUserAge: state => state.userAge
//   })
// };
//
// const fn: GetSelectorFunc = (...args: any[]): any => {
//   return 1;
// };
//
// const result1 = fn(userModel, 'getUsername');
