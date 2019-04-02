import Immutable from 'seamless-immutable';
import * as R from 'ramda';
import * as types from '../types';
import * as defaultSettings from '@/utils/defaultSettingsUtil';
import * as api from '../services/userManagement';

const initialEditorData = {
  userName: { value: '' },
  age: { value: 18 },
  sex: { value: 'male' },
  address: { value: '' }
};

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
  editor: {
    showing: false,
    submitting: false,
    data: initialEditorData,
    error: null
  }
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
      state.setIn(['toolbar', 'searchKeywords'], payload),

    [types.USER_EDITOR_ADD]: (state) => {
      return state.merge({
        editor: {
          showing: true,
          data: R.clone(initialEditorData)
        }
      }, { deep: true });
    },

    [types.USER_EDITOR_CLOSE]: (state) => state.setIn(['editor', 'showing'], false),

    [types.USER_EDITOR_SAVE_FIELDS]: (state, { payload }) => {
      const data = R.mapObjIndexed(
        (fieldObj) => ({ value: fieldObj.value })
      )(payload);

      return state.merge({
        editor: { data }
      }, { deep: true });
    },

    [types.USER_EDITOR_SUBMIT]: (state) => {
      return state.setIn(['editor', 'submitting'], true);
    },

    [types.USER_EDITOR_SUBMIT_SUCCESS]: (state) => {
      return state.merge({
        editor: {
          showing: false,
          submitting: false
        }
      }, { deep: true });
    },

    [types.USER_EDITOR_SUBMIT_FAIL]: (state, { payload }) =>
      state.merge(
        { editor: { submitting: false, error: payload } },
        { deep: true }
      ),
  },

  actions: {
    reloadUserTable: types.USER_TABLE_RELOAD,
    updateUserTableParams: types.USER_TABLE_PARAMS_UPDATE,
    updateUserSearchKeywords: types.USER_TOOLBAR_SEARCH_KEYWORDS_UPDATE,
    addUser: types.USER_EDITOR_ADD,
    closeUserEditor: types.USER_EDITOR_CLOSE,
    saveUserEditorFields: types.USER_EDITOR_SAVE_FIELDS,
    submitUserData: [types.USER_EDITOR_SUBMIT, undefined, () => ({ isPromise: true })]
  },

  selectors: ({ createSelector }) => {
    const getUserToolbar = (state) => state.views.userManagement.toolbar;
    const getUserTable = (state) => state.views.userManagement.table;
    const getUserEditor = (state) => state.views.userManagement.editor;

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
      getUserEditor,
      getUserTableView
    };
  },

  sagas: ({ select, put, call }, { getAction, getSelector }) => ({
    * [types.USER_TABLE_RELOAD]() {
      const table = yield select(getSelector('getUserTable'));
      if (!table.loading) {
        yield put(getAction('updateUserTableParams')({
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
          const table = yield select(getSelector('getUserTable'));
          const toolbar = yield select(getSelector('getUserToolbar'));
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
    ],

    * [types.USER_TOOLBAR_SEARCH_KEYWORDS_UPDATE]() {
      yield put(getAction('reloadUserTable')());
    },

    * [types.USER_EDITOR_SUBMIT]({ payload }) {
      try {
        const ret = yield call(api.saveUserData, payload);
        yield put({ type: types.USER_EDITOR_SUBMIT_SUCCESS, payload: ret });
        yield put(getAction('reloadUserTable')());
        return ret;
      } catch (err) {
        yield put({ type: types.USER_EDITOR_SUBMIT_FAIL, payload: err });
        console.error(err);
      }
    }
  })
};
