import { createStore, applyMiddleware, compose } from 'redux';

export default function (
  {
    reducers,
    preloadedState,
    middlewares,
    devtools = noop => noop
  }) {
  const enhancers = [
    applyMiddleware(...middlewares),
    devtools
  ];

  return createStore(reducers, preloadedState, compose(...enhancers));
}
