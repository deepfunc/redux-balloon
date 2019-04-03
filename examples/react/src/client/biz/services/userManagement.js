import { fetcher } from '@/utils/fetcher';

export function getUserTableData(paging, searchKeywords) {
  return fetcher.postJSON('/api/userManagement/getTableData', { paging, searchKeywords });
}

export function saveUserData(user) {
  return fetcher.postJSON('/api/userManagement/saveUserData', user);
}
