import { isApiAction, isPromiseAction } from '../actionCreator';

export default function promiseMiddleware() {
  return next => action => {
    if (isApiAction(action) || isPromiseAction(action)) {
      return new Promise((resolve, reject) => {
        next({
          _resolve: resolve,
          _reject: reject,
          ...action
        });
      });
    } else {
      return next(action);
    }
  };
}
