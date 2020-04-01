import { AnyAction } from 'redux';
import { isApiAction, isPromiseAction } from '../actionDefiner';

export default function promiseMiddleware() {
  return (next: any) => (action: AnyAction) => {
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
