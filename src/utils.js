import { NAMESPACE_SEP } from './constants';

export function pathOfNS(namespace) {
  return namespace.split(NAMESPACE_SEP);
}

export function noop() {
}

export function identity(x) {
  return x;
}

export function path(paths, obj) {
  let val = obj;
  for (let i = 0; i < paths.length; i++) {
    if (val == null) {
      break;
    }
    val = val[paths[i]];
  }
  return val;
}

export function init(list) {
  return list.slice(0, -1);
}

export function assoc(prop, val, obj) {
  const result = {};
  for (const p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
}

export function dissoc(prop, obj) {
  const result = {};
  for (const p in obj) {
    result[p] = obj[p];
  }
  delete result[prop];
  return result;
}

export function assocPath(path, val, obj) {
  if (path.length === 0) {
    return val;
  }
  const idx = path[0];
  if (path.length > 1) {
    const nextObj = obj != null ? obj[idx] : {};
    val = assocPath(path.slice(1), val, nextObj);
  }
  return assoc(idx, val, obj);
}

export function dissocPath(path, obj) {
  if (path.length === 0) {
    return obj;
  } else if (path.length === 1) {
    return dissoc(path[0], obj);
  } else {
    const head = path[0];
    const tail = path.slice(1);
    if (obj[head] == null) {
      return obj;
    } else {
      return assoc(head, dissocPath(tail, obj[head]), obj);
    }
  }
}

export function forEachObjIndexed(fn, obj) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    fn(obj[key], key, obj);
  }
}

export function mapObjIndexed(fn, obj) {
  const keys = Object.keys(obj);
  return keys.reduce(function (acc, key) {
    acc[key] = fn(obj[key], key, obj);
    return acc;
  }, {});
}

export function any(pred, list) {
  let ret;

  for (const item of list) {
    ret = pred(item);
    if (ret) {
      break;
    }
  }
  return ret;
}

export function filter(pred, filterable) {
  return filterable.filter(pred);
}

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
export function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

export const isArray = Array.isArray.bind(Array);

export function isFunction(o) {
  return typeof o === 'function';
}

export function lazyInvoker(lazyTarget, methodNamespace) {
  return function (...args) {
    const target = isFunction(lazyTarget) ? lazyTarget() : lazyTarget;
    const pathArr = pathOfNS(methodNamespace);
    const thisArg = path(init(pathArr), target);
    const method = path(pathArr, target);

    return method.apply(thisArg, args);
  };
}

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
export function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
  } catch (e) {
  } // eslint-disable-line no-empty
}

export function isProdENV() {
  return process.env.NODE_ENV === 'production';
}

export function getTypeOfCancelSaga(namespace) {
  return `${namespace}/@@CANCEL_SAGA`;
}
