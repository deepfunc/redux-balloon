import { createStore, applyMiddleware, compose } from 'redux';

export default function (
  {
    reducers,
    initialState,
    middlewares,
    devtools = noop => noop
  }) {
  const enhancers = [
    applyMiddleware(...middlewares),
    devtools
  ];

  return createStore(reducers, initialState, compose(...enhancers));
}
