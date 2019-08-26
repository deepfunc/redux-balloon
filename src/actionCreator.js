const API_ACTION_META_BASE = { isApi: true };
const PROMISE_ACTION_META_BASE = { isPromise: true };

function createApiAction(action, isLatest = true) {
  if (typeof action === 'string') {
    return [action, undefined, createApiMetaCreator(undefined, isLatest)];
  } else {
    return [
      action[0],
      action[1],
      createApiMetaCreator(action[2], isLatest)
    ];
  }
}

function createApiMetaCreator(prevMetaCreator, isLatest) {
  let newMeta = { ...API_ACTION_META_BASE, isLatest };
  if (typeof prevMetaCreator === 'function') {
    newMeta = { ...prevMetaCreator(), ...newMeta };
  }
  return () => newMeta;
}

function createPromiseAction(action) {
  if (typeof action === 'string') {
    return [action, undefined, createPromiseMetaCreator()];
  } else {
    return [
      action[0],
      action[1],
      createPromiseMetaCreator(action[2])
    ];
  }
}

function createPromiseMetaCreator(prevMetaCreator) {
  let newMeta = { ...PROMISE_ACTION_META_BASE };
  if (typeof prevMetaCreator === 'function') {
    newMeta = { ...prevMetaCreator(), ...newMeta };
  }
  return () => newMeta;
}

function isApiAction(action) {
  return (action.meta && action.meta.isApi === true);
}

function isLatestForApiAction(action) {
  return (action.meta && action.meta.isApi === true && action.meta.isLatest === true);
}

function isEveryForApiAction(action) {
  return (action.meta && action.meta.isApi === true && action.meta.isLatest === false);
}

function isPromiseAction(action) {
  return (action.meta && action.meta.isPromise === true);
}

const actionCreator = {
  createApiAction,
  createPromiseAction
};
export {
  actionCreator,
  isApiAction,
  isLatestForApiAction,
  isEveryForApiAction,
  isPromiseAction
};
