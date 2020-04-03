import * as Reselect from 'reselect';

export type SelectorFunctionAny = (...args: any[]) => any;

export type GetSelectorFunc = <S extends {}>(selectorName: keyof S) => SelectorFunctionAny;

export type SelectorsDefinitionMapObject<S> = {
  [P in keyof S]: SelectorFunctionAny;
};

type ReselectType = typeof Reselect;

export type ReselectObject = {
  [P in keyof ReselectType]: ReselectType[P];
};

export type SelectorsDefinitionFunc<S> =
  (
    injectObj: ReselectObject & { getSelector: GetSelectorFunc; }
  ) => SelectorsDefinitionMapObject<S>;
