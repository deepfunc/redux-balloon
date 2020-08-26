import balloon, { Model } from '../src/index';

describe('getSelector', () => {
  test('should getSelector', () => {
    const biz = balloon();

    type UserState = {
      userName: string;
      userAge: number;
    };

    type UserSelectors = {
      getUsername: (state: UserState) => string;
      getUserAge: (state: UserState) => number;
      getUser: (state: UserState) => UserState;
    };

    const userModel: Model<UserState, any, UserSelectors> = {
      namespace: 'user',
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

  test('should getSelector for merge namespace', () => {
    const biz = balloon();

    type SomeState = {
      some: string;
    };

    type SomeSelectors = {
      getSome: (state: SomeState) => string;
    };

    const someModel: Model<SomeState, any, SomeSelectors> = {
      namespace: 'some',
      state: { some: 'hello' },
      reducers: {},
      selectors: () => ({
        getSome: state => state.some
      })
    };

    type OtherState = {
      other: number;
    };

    type OtherSelectors = {
      getOther: (state: OtherState) => number;
    };

    const otherModel: Model<OtherState, any, OtherSelectors> = {
      namespace: 'some.other',
      state: { other: 666 },
      reducers: {},
      selectors: () => ({
        getOther: state => state.other
      })
    };

    biz.model(someModel).model(otherModel);
    biz.run();

    const getSome = biz.getSelector(someModel, 'getSome');
    expect(getSome(biz.store!.getState())).toBe('hello');
    const getOther = biz.getSelector(otherModel, 'getOther');
    expect(getOther(biz.store!.getState())).toBe(666);
  });
});
