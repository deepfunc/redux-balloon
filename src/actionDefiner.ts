import { AnyAction } from 'redux';
import {
  MetaOfApiAction,
  MetaCreator,
  ActionDefinitionTuple,
  MetaOfPromiseAction,
  ApiAction,
  PromiseAction,
  DefApiActionFunc,
  DefPromiseActionFunc,
  ActionDefiner
} from './types/actions';
import { isArray, identity } from './utils';

const defApiAction: DefApiActionFunc = function <Payload, Meta>(
  actDef: string | ActionDefinitionTuple<Payload, Meta>,
  isLatest: boolean = true
) {
  if (isActionDefinitionTuple(actDef)) {
    const type = actDef[0];
    const payloadCreator = actDef[1] != null ? actDef[1] : identity;
    const metaCreator = actDef[2] != null
      ? createApiMetaCreator(isLatest, actDef[2])
      : createApiMetaCreator(isLatest);
    return [type, payloadCreator, metaCreator];
  } else {
    return [actDef, identity, createApiMetaCreator(isLatest)];
  }
};

function isActionDefinitionTuple(o: any): o is ActionDefinitionTuple<any, any> {
  return isArray(o) && o.length >= 1 && o.length <= 3;
}

function createApiMetaCreator(isLatest: boolean): MetaCreator<MetaOfApiAction>;

function createApiMetaCreator<T>(
  isLatest: boolean,
  prevMetaCreator: MetaCreator<T>
): MetaCreator<MetaOfApiAction & T>;

function createApiMetaCreator<T>(
  isLatest: boolean,
  prevMetaCreator?: MetaCreator<T>
): MetaCreator<MetaOfApiAction> | MetaCreator<MetaOfApiAction & T> {
  const apiMetaBase: MetaOfApiAction = { isApi: true, isLatest };
  return prevMetaCreator == null
    ? createMergeMetaCreator(apiMetaBase)
    : createMergeMetaCreator(apiMetaBase, prevMetaCreator);
}

const defPromiseAction: DefPromiseActionFunc = function <Payload, Meta>(
  actDef: string | ActionDefinitionTuple<Payload, Meta>
) {
  if (isActionDefinitionTuple(actDef)) {
    const type = actDef[0];
    const payloadCreator = actDef[1] != null ? actDef[1] : identity;
    const metaCreator = actDef[2] != null
      ? createPromiseMetaCreator(actDef[2])
      : createPromiseMetaCreator();
    return [type, payloadCreator, metaCreator];
  } else {
    return [actDef, identity, createPromiseMetaCreator()];
  }
};

function createPromiseMetaCreator(): MetaCreator<MetaOfPromiseAction>;

function createPromiseMetaCreator<T>(
  prevMetaCreator: MetaCreator<T>
): MetaCreator<MetaOfPromiseAction & T>;

function createPromiseMetaCreator<T>(
  prevMetaCreator?: MetaCreator<T>
): MetaCreator<MetaOfPromiseAction> | MetaCreator<MetaOfPromiseAction & T> {
  const promiseMetaBase: MetaOfPromiseAction = { isPromise: true };
  return prevMetaCreator == null
    ? createMergeMetaCreator(promiseMetaBase)
    : createMergeMetaCreator(promiseMetaBase, prevMetaCreator);
}

function createMergeMetaCreator<MetaBase extends object>(
  base: MetaBase
): MetaCreator<MetaBase>;

function createMergeMetaCreator<MetaBase extends object, T>(
  base: MetaBase,
  metaCreator: MetaCreator<T>
): MetaCreator<MetaBase & T>;

function createMergeMetaCreator<MetaBase extends object, T>(
  base: MetaBase,
  metaCreator?: MetaCreator<T>
): MetaCreator<MetaBase> | MetaCreator<MetaBase & T> {
  let meta: MetaBase | MetaBase & T = base;

  return function (...args: any[]) {
    if (metaCreator != null) {
      meta = { ...metaCreator.apply(metaCreator, args), ...meta };
    }

    return meta;
  };
}

function isApiAction(action: AnyAction): action is ApiAction<any> {
  return (action.meta && action.meta.isApi);
}

function isLatestForApiAction(action: ApiAction<any>): boolean {
  return (action.meta && action.meta.isApi && action.meta.isLatest === true);
}

function isPromiseAction(action: AnyAction): action is PromiseAction<any> {
  return (action.meta && action.meta.isPromise);
}

const actionDefiner: ActionDefiner = {
  defApiAction,
  defPromiseAction
};

export {
  actionDefiner,
  isApiAction,
  isLatestForApiAction,
  isPromiseAction,
  isActionDefinitionTuple
};
