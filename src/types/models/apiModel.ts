import { Action } from 'redux-actions';
import { StringIndexObject } from '../utils';
import { ApiStatus } from '../../models/api/constants';

export interface ApiModelOptions {
  apiMap: StringIndexObject;
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
