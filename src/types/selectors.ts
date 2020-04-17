import * as Reselect from 'reselect';

export type SelectorFunction<S = any, R = any> =
  (state: S, ...args: any[]) => R;

export type GetSelectorFunc =
  <Selectors extends {}, Name extends keyof Selectors>(selectorName: Name) => Selectors[Name];

export type SelectorsDefinitionMapObject<Selectors, State> = {
  [P in keyof Selectors]: SelectorFunction<State>;
};

type ReselectType = typeof Reselect;

export type ReselectObject = {
  [P in keyof ReselectType]: ReselectType[P];
};

export type SelectorsDefinitionFunc<Selectors, State> =
  (
    injectObj: ReselectObject & { getSelector: GetSelectorFunc }
  ) => SelectorsDefinitionMapObject<Selectors, State>;
