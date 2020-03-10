import { StringIndexObject } from './types/utils';
import { NAMESPACE_SEP } from './constants';

export function pathArrayOfNS(namespace: string): string[] {
  return namespace.split(NAMESPACE_SEP);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {
}

export function identity(x: any): any {
  return x;
}

export function path(paths: string[], obj: StringIndexObject): any {
  let val: any = obj;
  for (let i = 0; i < paths.length; i++) {
    if (val == null) {
      break;
    }
    val = val[paths[i]];
  }
  return val;
}

export function init(list: any[]): any[] {
  return list.slice(0, -1);
}

export function assoc(prop: string, val: any, obj: StringIndexObject): StringIndexObject {
  const result: StringIndexObject = {};
  for (const p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
}

export function dissoc(prop: string, obj: StringIndexObject): StringIndexObject {
  const result: StringIndexObject = {};
  for (const p in obj) {
    result[p] = obj[p];
  }
  delete result[prop];
  return result;
}

export function assocPath(path: string[], val: any, obj: StringIndexObject): StringIndexObject {
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

export function dissocPath(path: string[], obj: StringIndexObject): StringIndexObject {
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

export function mergeDeepWithKey(
  fn: (key: string, lVal: any, rVal: any) => any,
  lObj: StringIndexObject,
  rObj: StringIndexObject
): StringIndexObject {
  return mergeWithKey(function (k, lVal, rVal) {
    if (isPlainObject(lVal) && isPlainObject(rVal)) {
      return mergeDeepWithKey(fn, lVal, rVal);
    } else {
      return fn(k, lVal, rVal);
    }
  }, lObj, rObj);
}

export function mergeWithKey(
  fn: (key: string, lVal: any, rVal: any) => any,
  lObj: StringIndexObject,
  rObj: StringIndexObject
): StringIndexObject {
  const result: StringIndexObject = {};
  const lKeys = Object.keys(lObj);
  const rKeys = Object.keys(rObj);

  for (const k of lKeys) {
    result[k] = rObj.hasOwnProperty(k) ? fn(k, lObj[k], rObj[k]) : lObj[k];
  }

  for (const k of rKeys) {
    if (!result.hasOwnProperty(k)) {
      result[k] = rObj[k];
    }
  }

  return result;
}

export function pick(names: string[], obj: StringIndexObject): StringIndexObject {
  const result: StringIndexObject = {};
  let idx = 0;
  while (idx < names.length) {
    if (obj.hasOwnProperty(names[idx])) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
}

export function forEachObjIndexed(
  fn: (val: any, key: string, obj: StringIndexObject) => void,
  obj: StringIndexObject
): void {
  const keys = Object.keys(obj);
  for (const key of keys) {
    fn(obj[key], key, obj);
  }
}

export function mapObjIndexed(
  fn: (val: any, key: string, obj: StringIndexObject) => any,
  obj: StringIndexObject
): StringIndexObject {
  const keys = Object.keys(obj);
  return keys.reduce(function (acc: { [key: string]: any }, key) {
    acc[key] = fn(obj[key], key, obj);
    return acc;
  }, {});
}

export function any(pred: (item: any) => boolean, list: any[]): boolean {
  let ret = false;

  for (const item of list) {
    ret = pred(item);
    if (ret) {
      break;
    }
  }
  return ret;
}

export function filter(
  pred: (item: any) => boolean,
  filterable: { filter(item: any): any[] }
): any[] {
  return filterable.filter(pred);
}

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
export function isPlainObject(obj: object): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

export const isArray: typeof Array.isArray = Array.isArray.bind(Array);

export function isFunction(o: any): o is Function {
  return typeof o === 'function';
}

export function lazyInvoker(lazyTarget: Function | object, methodNamespace: string): any {
  return function (...args: any[]) {
    const target = isFunction(lazyTarget) ? lazyTarget() : lazyTarget;
    const pathArr = pathArrayOfNS(methodNamespace);
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
export function warning(message: string): void {
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
    // eslint-disable-line no-empty
  }
}

export function isProdENV(): boolean {
  return process.env.NODE_ENV === 'production';
}
