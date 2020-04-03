import { StringIndexObject } from '../../../types/utils';
import { SelectorFunctionAny } from '../../../types/selectors';
import { ApiStatus } from '../constants';

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
