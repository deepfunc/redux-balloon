import { fetcher } from '@/utils/fetcher';

export function getUserTableData(skip, max, keywords) {
  return fetcher.postJSON('/api/userManagement/getTableData', { skip, max, keywords });
}
