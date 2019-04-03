export default function promiseMiddleware(store) {
  return next => action => {
    const { meta = {} } = action;
    if (meta.isPromise === true) {
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
