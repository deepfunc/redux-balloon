/**
 * @template S The type of state.
 */
export interface Model<S> {
  namespace: string;
  state: S;
}
