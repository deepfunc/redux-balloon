import { Action } from 'redux-actions';
import { StringIndexObject } from '../utils';
import { ApiStatus } from '../..';

export type ApiMap = StringIndexObject;

export interface ApiModelOptions {
  apiMap: ApiMap;
  namespace?: string;
}

export interface ApiStatusInfo {
  status: ApiStatus;
  error?: Error;
}
export type ApiModelState = {
  [apiName: string]: ApiStatusInfo;
};

export type InitApiStatusAction = Action<undefined>;

export type ApiModelActions = {
  initApiStatus: () => InitApiStatusAction;
};

export type ApiModelSelectors = {
  getApiStatus: (
    state: ApiModelState,
    apiName: string
  ) => ApiStatusInfo | undefined;
};
