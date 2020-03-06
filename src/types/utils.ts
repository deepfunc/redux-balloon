export interface StringIndexObject {
  [prop: string]: any;
}

export type NonNullableProperties<T> = { [K in keyof T]: NonNullable<T[K]> };

export type NonNullableAndRequiredProperties<T> = NonNullableProperties<Required<T>>;
