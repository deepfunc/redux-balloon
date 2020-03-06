import { actionCreator } from '../src/actionCreator';

describe('actionCreator', () => {
  test('should define api action', () => {
    let actionDef = actionCreator.defApiAction('TYPE_TEST');
    expect(actionDef.length).toBe(3);
    expect(actionDef[0]).toBe('TYPE_TEST');
    expect(actionDef[1](1)).toBe(1);
    expect(actionDef[2]()).toEqual({ isApi: true, isLatest: true });

    actionDef = actionCreator.defApiAction(
      [
        'TYPE_TEST',
        (obj) => ({ ...obj, hello: 'world' })
      ],
      false);
    expect(actionDef[1]({ a: 1 })).toEqual({
      a: 1,
      hello: 'world'
    });
    expect(actionDef[2]()).toEqual({ isApi: true, isLatest: false });

    actionDef = actionCreator.defApiAction([
      'TYPE_TEST',
      null,
      () => ({ hello: 'world' })
    ]);
    expect(actionDef[1](1)).toBe(1);
    expect(actionDef[1]({ a: 1 })).toEqual({ a: 1 });
    expect(actionDef[2]()).toEqual({
      isApi: true,
      isLatest: true,
      hello: 'world'
    });
  });
});
