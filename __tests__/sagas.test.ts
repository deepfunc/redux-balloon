import balloon, { Model, Action } from '../src/index';

describe('sagas', () => {
  test('should create sagas', () => {
    const biz = balloon();

    type UserState = {
      userName: string;
      userAge: number;
    };

    type UserActions = {
      updateUsername: (name: string) => Action<string>;
      updateUserAge: (age: number) => Action<number>;
    };

    type UserSelectors = {
      getUsername: (state: UserState) => string;
      getUserAge: (state: UserState) => number;
      getUserInfo: (state: UserState) => UserState;
    };

    const UPDATE_USER_NAME = 'UPDATE_USER_NAME';
    const UPDATE_USER_AGE = 'UPDATE_USER_AGE';

    const userModel: Model<UserState, UserActions, UserSelectors> = {
      namespace: 'user',
      state: { userName: 'Deep', userAge: 36 },
      reducers: {},
      actions: () => ({
        updateUsername: UPDATE_USER_NAME,
        updateUserAge: UPDATE_USER_AGE
      }),
      selectors: () => ({
        getUsername: state => state.userName,
        getUserAge: state => state.userAge,
        getUserInfo: state => state
      }),
      sagas: (effects, { getSelector, getAction }) => {
        const { select, put } = effects;

        return {
          *[UPDATE_USER_NAME](
            action: ReturnType<UserActions['updateUsername']>
          ) {
            const getUsername = getSelector(userModel, 'getUsername');
            // const oldUsername: ReturnType<
            //   UserSelectors['getUsername']
            // > = yield select(getUsername);
            const oldUsername: ReturnType<typeof getUsername> = yield select(
              getUsername
            );
            console.log(`oldUsername: ${oldUsername}`);
            console.log(`newUserName: ${action.payload}`);

            const updateUserAge = getAction(userModel, 'updateUserAge');
            yield put(updateUserAge(32));
          },

          *[UPDATE_USER_AGE](action) {
            console.log('UPDATE_USER_AGE', action);
          },

          '^UPDATE_USER_[A-Z]+$': [
            function* (action) {
              console.log('^UPDATE_USER_[A-Z]+$', action);
            },
            {
              type: 'takeEvery',
              isRegExpPattern: true,
              regExpPatternFlags: 'g'
            }
          ]
        };
      }
    };

    biz.model(userModel);
    biz.run();

    const updateUsename = biz.getAction(userModel, 'updateUsername');
    if (biz.store) {
      biz.store.dispatch(updateUsename('Xie Kai'));
    }
  });
});
