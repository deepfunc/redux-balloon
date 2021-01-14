import { BizStatus } from '../constants';
import { Model } from './model';
import { StringIndexObject } from './utils';
import { GetActionFunc } from './actions';
import { GetSelectorFunc } from './selectors';
import { ApiModelOptions } from './models/apiModel';
import { EnhanceReducerFunc } from './reducers';
import { Store } from 'redux';
import SagaError from '../SagaError';

export interface Biz {
  status: BizStatus;
  models: any[];
  model: (model: Model) => Biz;
  addModels: (models: Model[]) => Biz;
  unmodel: (namespace: string) => void;
  getModel: (namespace: string) => Model | undefined;
  run: (opts?: BizRunOptions) => void;
  actions: StringIndexObject;
  getAction: GetActionFunc;
  selectors: StringIndexObject;
  getSelector: GetSelectorFunc;
  store?: Store;
}

export interface BizRunOptions {
  onEnhanceStore?: (store: any) => any;
  onEnhanceReducer?: EnhanceReducerFunc;
  apiModel?: ApiModelOptions;
  usePromiseMiddleware?: boolean;
  middlewares?: any[];
  devtools?: any;
  onSagaError?: (err: SagaError) => void;
}
