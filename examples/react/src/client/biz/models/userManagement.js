import Immutable from 'seamless-immutable';
import * as types from '../types';
import * as defaultSettings from '@/utils/defaultSettingsUtil';
import * as api from '../services/userManagement';

const initialState = Immutable({
  toolbar: { searchKeywords: '' },
  table: {
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
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
            pagination: { ...payload.pagination }
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
      state.merge({ table: { loading: false, error: payload } }, { deep: true }),

    [types.USER_TOOLBAR_SEARCH_KEYWORDS_UPDATE]: (state, { payload }) =>
      state.setIn(['toolbar', 'searchKeywords'], payload)
  },
  actions: {
    reloadUserTable: [types.USER_TABLE_RELOAD],
    updateUserTableParams: [types.USER_TABLE_PARAMS_UPDATE],
    updateUserSearchKeywords: [types.USER_TOOLBAR_SEARCH_KEYWORDS_UPDATE]
  },
  selectors: ({ createSelector }) => {
    const getUserToolbar = (state) => state.views.userManagement.toolbar;
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

    return {
      getUserTable,
      getUserToolbar,
      getUserTableView
    };
  },
  sagas: ({ select, put, call }, { actions, selectors }) => ({
    * [types.USER_TABLE_RELOAD]() {
      const table = yield select(selectors.getUserTable);
      if (!table.loading) {
        yield put(actions.updateUserTableParams({
          pagination: { current: 1 }
        }));
      }
    },

    * [types.USER_TABLE_PARAMS_UPDATE]() {
      yield put({ type: types.USER_TABLE_GET });
    },

    [types.USER_TABLE_GET]: [
      function* () {
        try {
          const table = yield select(selectors.getUserTable);
          const toolbar = yield select(selectors.getUserToolbar);
          const ret = yield call(
            api.getUserTableData,
            { current: table.pagination.current, pageSize: table.pagination.pageSize },
            toolbar.searchKeywords
          );
          yield put({ type: types.USER_TABLE_GET_SUCCESS, payload: ret });
        } catch (err) {
          yield put({ type: types.USER_TABLE_GET_FAIL, payload: err });
          console.error(err);
        }
      },
      { type: 'takeLatest' }
    ]
  })
};
