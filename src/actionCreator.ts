import { AnyAction } from 'redux';
import {
  MetaOfApiAction,
  MetaCreator,
  ActionDefinition,
  ActionDefinitionTuple,
  MetaOfPromiseAction,
  ApiAction,
  PromiseAction
} from './types/actions';

function createApiAction<Payload, Meta>(
  actDef: ActionDefinition<Payload, Meta>,
  isLatest: boolean = true
): ActionDefinitionTuple<Payload, MetaOfApiAction> {
  if (typeof actDef === 'string') {
    return [actDef, null, createApiMetaCreator(null, isLatest)];
  } else {
    return [
      actDef[0],
      actDef[1],
      createApiMetaCreator(actDef[2], isLatest)
    ];
  }
}

function createApiMetaCreator<Meta>(
  prevMetaCreator: MetaCreator<Meta> | null | undefined,
  isLatest: boolean
): MetaCreator<MetaOfApiAction> {
  return createMetaCreator({ isApi: true, isLatest }, prevMetaCreator);
}

function createPromiseAction<Payload, Meta>(
  actDef: ActionDefinition<Payload, Meta>,
): ActionDefinitionTuple<Payload, MetaOfPromiseAction> {
  if (typeof actDef === 'string') {
    return [actDef, null, createPromiseMetaCreator(null)];
  } else {
    return [
      actDef[0],
      actDef[1],
      createPromiseMetaCreator(actDef[2])
    ];
  }
}

function createPromiseMetaCreator<Meta>(
  prevMetaCreator: MetaCreator<Meta> | null | undefined
): MetaCreator<MetaOfPromiseAction> {
  return createMetaCreator({ isPromise: true }, prevMetaCreator);
}

function createMetaCreator(
  metaBase: object,
  prevMetaCreator: MetaCreator<any> | null | undefined
): MetaCreator<any> {
  let meta: any = metaBase;

  return function (...args: any[]) {
    if (prevMetaCreator != null) {
      meta = { ...prevMetaCreator.apply(prevMetaCreator, args), ...meta };
    }

    return meta;
  };
}

function isApiAction(action: AnyAction): action is ApiAction<any> {
  return (action.meta && action.meta.isApi === true);
}

function isLatestForApiAction(action: ApiAction<any>): boolean {
  return (action.meta && action.meta.isApi === true && action.meta.isLatest === true);
}

function isPromiseAction(action: AnyAction): action is PromiseAction<any> {
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
  isPromiseAction
};
