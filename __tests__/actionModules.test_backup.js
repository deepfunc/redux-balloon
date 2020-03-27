import {
  addActionModule,
  delActionModule,
  createActions
} from '../src/actionModules';

import { createAction } from 'redux-actions';

describe('actionModules', () => {
  test('[model.actions] could be undefined', () => {
    const fn = createAction(
      'TEST',
      (a, b) => {
        return { c: a + b };
      },
      (...args) => {
        console.log('args:', args);
        return args;
      }
    );
    const action = fn(1, 2, 3);
    console.log('action:', action);
    // const model = { namespace: 'hello' };
    // const actionModules = addActionModule(model, {});
    // expect(actionModules).toEqual({});
  });

  test('should add action module', () => {
    const actions = {
      getSome: ['SOME_GET']
    };
    const model = { namespace: 'hello', actions };
    expect(addActionModule(model, {})).toMatchObject({
      hello: [{ getSome: expect.any(Array) }]
    });
  });

  test('should add action module for namespace', () => {
    const actions = {
      getSome: ['SOME_GET']
    };
    const model = { namespace: 'a.b', actions };
    expect(addActionModule(model, {})).toMatchObject({
      a: {
        b: [{ getSome: expect.any(Array) }]
      }
    });
  });

  test('should delete action module', () => {
    const actions = {
      getSome: ['SOME_GET']
    };
    const model = { namespace: 'hello', actions };
    let actionModules = addActionModule(model, {});
    actionModules = delActionModule('hello', actionModules);
    expect(actionModules).toEqual({});
  });

  test('should create actions from actionModules', () => {
    let actionModules = addActionModule(
      { namespace: 'a', actions: { getSome: ['SOME_GET'] } },
      {}
    );
    actionModules = addActionModule(
      { namespace: 'b.c', actions: { getOther: ['OTHER_GET'] } },
      actionModules
    );
    const actions = createActions(actionModules);

    expect(actions.a.getSome).toEqual(expect.any(Function));
    expect(actions.b.c.getOther).toEqual(expect.any(Function));
    expect(actions.getSome).toEqual(expect.any(Function));
    expect(actions.getOther).toEqual(expect.any(Function));
  });

  test('should create actions of using payloadCreator', () => {
    const actionModules = addActionModule(
      {
        namespace: 'a',
        actions: {
          getSome: [
            'SOME_GET',
            (n) => n + 1
          ]
        }
      }
    );
    const actions = createActions(actionModules);

    expect(actions.a.getSome(3)).toEqual({ type: 'SOME_GET', payload: 4 });
  });

  test('should create actions of using metaCreator', () => {
    const actionModules = addActionModule(
      {
        namespace: 'a',
        actions: {
          getSome: [
            'SOME_GET',
            undefined,
            () => ({ admin: true })
          ]
        }
      }
    );
    const actions = createActions(actionModules);

    expect(actions.a.getSome(4)).toEqual({
      type: 'SOME_GET',
      payload: 4,
      meta: { admin: true }
    });
  });
});
