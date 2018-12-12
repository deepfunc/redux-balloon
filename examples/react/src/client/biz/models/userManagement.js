import Immutable from 'seamless-immutable';
import * as types from '../types';
import * as defaultSettings from '@/utils/defaultSettingsUtil';

const initialState = Immutable({
  toolbar: { keywords: null },
  table: {
    loading: false,
    pagination: {
      current: 1,
      pageSize: 15,
      total: 0
    },
    data: [],
    error: null
  },
  editor: {}
});

export default {
  namespace: 'views.userManagement',
  state: initialState,
  reducers: {
    [types.USER_TABLE_PARAMS_UPDATE]: (state, { payload }) => {
      return state.merge({
          table: {
            pagination: {
              current: payload.pagination.current,
              pageSize: payload.pagination.pageSize
            }
          }
        },
        { deep: true }
      );
    },

    [types.USER_TABLE_GET]: (state) => state.setIn(['table', 'loading'], true),

    [types.USER_TABLE_GET_SUCCESS]: (state, { payload }) => {
      return state.merge(
        {
          table: {
            loading: false,
            data: payload.items,
            pagination: { total: payload.total }
          }
        },
        { deep: true }
      );
    },

    [types.USER_TABLE_GET_FAIL]: (state, { payload }) =>
      state.merge({ table: { loading: false, error: payload } }, { deep: true })
  },
  actions: {
    reloadUserTable: [types.USER_TABLE_RELOAD],
    updateUserTableParams: [types.USER_TABLE_PARAMS_UPDATE]
  },
  selectors: ({ createSelector }) => {
    const getUserTable = (state) => state.views.userManagement.table;

    const getUserTableView = createSelector(
      getUserTable,
      (table) => {
        return table.merge(
          { pagination: defaultSettings.pagination },
          { deep: true }
        );
      }
    );

    return { getUserTable, getUserTableView };
  },
  sagas: ({ select, put, call }, { actions, selectors }) => ({
    * [types.USER_TABLE_RELOAD]() {
      const table = yield select(selectors.getUserTable);
      console.log(table);
    }
  })
};
