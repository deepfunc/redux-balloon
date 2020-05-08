import balloon, { Model, Action, ApiAction } from '../src/index';

describe('reducers', () => {
  test('should create reducers', () => {
    const biz = balloon();

    type UserState = {
      userName: string;
      userAge: number;
    };

    type UserActions = {
      fetchUserInfo: () => ApiAction<undefined>;
      updateUsername: (name: string) => Action<string>;
    };

    const FETCH_USER_INFO = 'FETCH_USER_INFO';
    const UPDATE_USER_NAME = 'UPDATE_USER_NAME';
    const FETCH_USER_INFO_SUCCESS = 'FETCH_USER_INFO_SUCCESS';

    const userModel: Model<UserState, UserActions, any> = {
      namespace: 'user',
      actions: ({ defApiAction }) => {
        return {
          fetchUserInfo: defApiAction(FETCH_USER_INFO),
          updateUsername: UPDATE_USER_NAME
        };
      },
      reducers: {
        fetchUserInfo(state, action) {
          console.log(`${action.type}:`, action);
          return state;
        },
        updateUsername(state, action) {
          console.log(`${action.type}:`, action);
          return Object.assign({}, state, { userName: action.payload });
        },
        [FETCH_USER_INFO_SUCCESS](state, action) {
          console.log(`${action.type}:`, action);
          return state;
        }
      }
    };

    biz.model(userModel);
    biz.run();

    const updateUsername = biz.getAction(userModel, 'updateUsername');
    biz.store!.dispatch(updateUsername('new name'));
    const fetchUserInfo = biz.getAction(userModel, 'fetchUserInfo');
    biz.store!.dispatch(fetchUserInfo());
    biz.store!.dispatch({ type: FETCH_USER_INFO_SUCCESS });
  });
});
