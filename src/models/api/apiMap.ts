import { ApiMap } from '../../types/models/apiModel';

let apiMap: ApiMap = {};

function mergeApiMap(source: ApiMap): ApiMap {
  apiMap = { ...apiMap, ...source };
  return apiMap;
}

function getApiMap(): ApiMap {
  return apiMap;
}

export { mergeApiMap, getApiMap };
