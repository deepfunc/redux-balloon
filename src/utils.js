import { split, always, path, init } from 'ramda';
import { NAMESPACE_SEP } from './constants';

export const pathOfNS = split(NAMESPACE_SEP);

export const noop = always(undefined);

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
  let target;
  let thisArg;
  let method;

  return function (...args) {
    if (target === undefined) {
      target = isFunction(lazyTarget) ? lazyTarget() : lazyTarget;
      const pathArr = pathOfNS(methodNamespace);
      thisArg = path(init(pathArr), target);
      method = path(pathOfNS(methodNamespace), target);
    }

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
