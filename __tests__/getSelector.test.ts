import balloon, { Model } from '../src/index';

describe('getSelector', () => {
  test('should getSelector', () => {
    const biz = balloon();

    type UserState = {
      userName: string;
      userAge: number;
    };

    type UserSelectors = () => {
      getUsername: (state: UserState) => string;
      getUserAge: (state: UserState) => number;
      getUser: (state: UserState) => UserState;
    };

    const userModel: Model<UserState, any, UserSelectors> = {
      namespace: 'gobal.user',
      state: { userName: 'Deep', userAge: 36 },
      reducers: {},
      selectors: () => ({
        getUsername: state => state.userName,
        getUserAge: state => state.userAge,
        getUser: state => state
      })
    };

    biz.model(userModel);
    biz.run();

    const getUsername = biz.getSelector(userModel, 'getUsername');
    expect(getUsername(biz.store!.getState())).toBe('Deep');

    const getUserAge = biz.getSelector(userModel, 'getUserAge');
    expect(getUserAge(biz.store!.getState())).toBe(36);

    const getUsernameEx = biz.getSelector('getUsername');
    expect(getUsernameEx(biz.store!.getState())).toBe('Deep');
  });
});
