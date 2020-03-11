import { createAction } from 'redux-actions';
import {
  actionDefiner,
  isApiAction,
  isLatestForApiAction,
  isPromiseAction
} from '../src/actionDefiner';

describe('actionCreator', () => {
  test('should define api action', () => {
    let actionDef = actionDefiner.defApiAction('TYPE_TEST');
    expect(actionDef.length).toBe(3);
    expect(actionDef[0]).toBe('TYPE_TEST');
    expect(actionDef[1](1)).toBe(1);
    expect(actionDef[2]()).toEqual({ isApi: true, isLatest: true });

    actionDef = actionDefiner.defApiAction(
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

    actionDef = actionDefiner.defApiAction([
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

  test('should be an api action', () => {
    const actionDef = actionDefiner.defApiAction('TYPE_TEST');
    const action = createAction(...actionDef);
    expect(isApiAction(action())).toBe(true);
  });

  test('should be an api action and for latest', () => {
    const actionDef = actionDefiner.defApiAction('TYPE_TEST');
    const action = createAction(...actionDef);
    expect(isLatestForApiAction(action())).toBe(true);
  });

  test('should be an api action and not for latest', () => {
    const actionDef = actionDefiner.defApiAction('TYPE_TEST', false);
    const action = createAction(...actionDef);
    expect(isLatestForApiAction(action())).toBeFalsy();
  });

  test('should not be an api action', () => {
    const action: any = () => ({ type: 'TYPE_TEST', payload: 'some' });
    expect(isApiAction(action())).toBeFalsy();
  });

  test('should define promise action', () => {
    let actionDef = actionDefiner.defPromiseAction('TYPE_TEST');
    expect(actionDef.length).toBe(3);
    expect(actionDef[0]).toBe('TYPE_TEST');
    expect(actionDef[1](1)).toBe(1);
    expect(actionDef[2]()).toEqual({ isPromise: true });

    actionDef = actionDefiner.defPromiseAction([
      'TYPE_TEST',
      (obj) => ({ ...obj, hello: 'world' })
    ]);
    expect(actionDef[1]({ a: 1 })).toEqual({
      a: 1,
      hello: 'world'
    });
    expect(actionDef[2]()).toEqual({ isPromise: true });

    actionDef = actionDefiner.defPromiseAction([
      'TYPE_TEST',
      null,
      () => ({ hello: 'world' })
    ]);
    expect(actionDef[1](1)).toBe(1);
    expect(actionDef[1]({ a: 1 })).toEqual({ a: 1 });
    expect(actionDef[2]()).toEqual({
      isPromise: true,
      hello: 'world'
    });
  });

  test('should be a promise action', () => {
    const actionDef = actionDefiner.defPromiseAction('TYPE_TEST');
    const action = createAction(...actionDef);
    expect(isPromiseAction(action())).toBe(true);
  });

  test('should not be a promise action', () => {
    const action: any = () => ({ type: 'TYPE_TEST', payload: 'some' });
    expect(isPromiseAction(action())).toBeFalsy();
  });
});
