import { split, always, last, init, reduce } from 'ramda';
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

export function isArray(o) {
  return Array.isArray(o);
}

export function isFunction(o) {
  return typeof o === 'function';
}

export function lazyInvoker(lazyTarget, methodPath) {
  const path = pathOfNS(methodPath);
  const methodName = last(path);
  let target;

  return function (...args) {
    if (target === undefined) {
      let currTarget = isFunction(lazyTarget) ? lazyTarget() : lazyTarget;
      if (path.length > 1) {
        currTarget = reduce((curr, value) => curr[value], currTarget, init(path));
      }
      target = currTarget;
    }

    const method = target[methodName];
    return method.apply(target, args);
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
