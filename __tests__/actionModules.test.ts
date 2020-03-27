import {
  addActionModule,
  delActionModule,
  createActions
} from '../src/actionModules';
import {
  Model,
  ActionsDefinitionMapObject,
  ActionsDefinitionFunc
} from '../src/types';

describe('actionModules', () => {
  test('[model.actions] could be undefined', () => {
    const model = { namespace: 'hello' };
    const actionModules = addActionModule(model, {});
    expect(actionModules).toEqual({});
  });

  test('should add action module for ActionType', () => {
    const actions = {
      getSome: 'SOME_GET'
    };
    const model = { namespace: 'hello', actions };
    expect(addActionModule(model, {})).toMatchObject({
      hello: [{ getSome: expect.any(String) }]
    });
  });

  test('should add action module for ActionDefinitionTuple', () => {
    let actions: ActionsDefinitionMapObject = {
      getSome: ['SOME_GET']
    };
    let model: Model<undefined> = {
      namespace: 'hello',
      actions
    };
    let modules = addActionModule(model, {});
    expect(modules).toMatchObject({
      hello: [{ getSome: expect.any(Array) }]
    });

    actions = {
      getSome: [
        'SOME_GET',
        payload => payload,
        () => ({ test: 1 })
      ]
    };
    model = {
      namespace: 'hello',
      actions
    };
    modules = addActionModule(model, {});
    expect(modules.hello[0].getSome.length).toBe(3);
    expect(modules.hello[0].getSome[0]).toBe('SOME_GET');
    expect(modules.hello[0].getSome[1]).toBeInstanceOf(Function);
    expect(modules.hello[0].getSome[2]).toBeInstanceOf(Function);
  });

  test('should add action module for ActionsDefinitionFunc', () => {
    const actions: ActionsDefinitionFunc = ({ defApiAction, defPromiseAction }) => ({
      getSome: ['SOME_GET'],
      getAnother: defApiAction('GET_ANOTHER'),
      getOther: defPromiseAction('GET_OTHER')
    });
    const model: Model<undefined> = {
      namespace: 'hello',
      actions
    };
    const modules = addActionModule(model, {});
    expect(modules).toMatchObject({
      hello: [expect.any(Function)]
    });
  });

  test('should add action module for namespace', () => {
    const actions = {
      getSome: 'SOME_GET'
    };
    const model = { namespace: 'a.b', actions };
    expect(addActionModule(model, {})).toMatchObject({
      a: {
        b: [{ getSome: expect.any(String) }]
      }
    });
  });

  test('should delete action module', () => {
    const actions = {
      getSome: 'SOME_GET'
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
            (n: number) => n + 1
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
