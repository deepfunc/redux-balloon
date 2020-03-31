import * as Reselect from 'reselect';

export type SelectorFunctionAny = <R>(...args: any[]) => R;

export type GetSelectorFunc = <S extends {}>(selectorName: keyof S) => SelectorFunctionAny;

export interface SelectorsDefinitionMapObject {
  [selectorName: string]: SelectorFunctionAny;
}

type ReselectType = typeof Reselect;

export type ReselectObject = {
  [P in keyof ReselectType]: ReselectType[P];
}

export type SelectorsDefinitionFunc =
  (injectObj: ReselectObject & { getSelector: GetSelectorFunc }) => SelectorsDefinitionMapObject;
