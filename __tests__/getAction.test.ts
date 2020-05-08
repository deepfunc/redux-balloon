import balloon, {
  Model,
  Action,
  ApiAction,
  ActionKey,
  ActionsDefinitionReturnType,
  ActionFuncType
} from '../src/index';

describe('getSelector', () => {
  test('should getSelector', () => {
    const biz = balloon();

    type UserActions = {
      fetchUserInfo: () => ApiAction<undefined>;
      updateUsername: (name: string) => Action<string>;
    };

    const FETCH_USER_INFO = 'FETCH_USER_INFO';
    const UPDATE_USER_NAME = 'UPDATE_USER_NAME';

    const userModel: Model<any, UserActions, any> = {
      namespace: 'user',
      actions: ({ defApiAction }) => {
        return {
          fetchUserInfo: defApiAction(FETCH_USER_INFO),
          updateUsername: UPDATE_USER_NAME
        };
      }
    };

    type T1 = ActionKey<typeof userModel>;
    type T2 = ActionsDefinitionReturnType<typeof userModel>;
    type T3 = ActionFuncType<typeof userModel, 'updateUsername'>;

    biz.model(userModel);
    biz.run();

    const fetchUserInfo = biz.getAction(userModel, 'fetchUserInfo');
    const action1 = fetchUserInfo();
    console.log(action1);
    const updateUsername = biz.getAction(userModel, 'updateUsername');
    const action2 = updateUsername('hello');
    console.log(action2);
    const fn = biz.getAction('fetchUserInfo');
    const action3 = fn();
    console.log(action3);
  });
});
