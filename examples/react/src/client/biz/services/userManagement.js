import { fetcher } from '@/utils/fetcher';

export function getUserTableData(paging, keywords) {
  return fetcher.postJSON('/api/userManagement/getTableData', { paging, keywords });
}
