import { StringIndexObject } from '../utils';
import { SelectorFunctionAny } from '../selectors';
import { ApiStatus } from '../../models/api/constants';

export interface ApiModelOptions {
  apiMap: StringIndexObject;
  namespace?: string;
}

export interface ApiStatusInfo {
  status: ApiStatus;
  error?: Error;
}
export interface ApiModelState {
  [apiName: string]: ApiStatusInfo;
}

export interface ApiModelSelectors {
  getApiStatus: SelectorFunctionAny;
}
