import {
  createStore,
  applyMiddleware,
  compose,
  Store
} from 'redux';

export default function (
  {
    reducers,
    preloadedState,
    middlewares,
    devtools = (noop: any) => noop
  }: any
): Store {
  const enhancers = [
    applyMiddleware(...middlewares),
    devtools
  ];

  return createStore(reducers, preloadedState, compose(...enhancers));
}
