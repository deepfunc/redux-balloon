import {
  addSelectorModule,
  delSelectorModule,
  createSelectors
} from '../src/selectorModules';

describe('selectorModules', () => {
  test('[model.selectors] could be undefined', () => {
    const model = { namespace: 'hello' };
    const selectorModules = addSelectorModule(model, {});
    expect(selectorModules).toEqual({});
  });

  test('should add selectors module', () => {
    const selectors = () => ({
      getA: (state) => state.a,
      getB: (state) => state.b
    });
    const model = { namespace: 'hello', selectors };
    expect(addSelectorModule(model, {})).toEqual({
      hello: [expect.any(Function)]
    });
  });

  test('should delete selectors module', () => {
    const selectors = () => ({
      getA: (state) => state.a,
      getB: (state) => state.b
    });
    const model = { namespace: 'hello', selectors };
    let selectorModules = addSelectorModule(model, {});
    selectorModules = delSelectorModule('hello', selectorModules);
    expect(selectorModules).toEqual({});
  });

  // test('should create selectors from selectorModules', () => {
  //   const modelA = {
  //     namespace: 'a',
  //     selectors: () => ({
  //       getCountOfA: (state) => state.a.count
  //     })
  //   };
  //   const modelB = {
  //     namespace: 'b',
  //     selectors: ({createSelector, getSelector}) => ({
  //       getCountOfB1: (state) => state.b.count,
  //       getCountOfB2: createSelector(
  //         getSelector('a.getCountOfA'),
  //         (count) => count + 1
  //       )
  //     })
  //   };
  //   let selectorModules = addSelectorModule(modelA, {});
  //   selectorModules = addSelectorModule(modelB, selectorModules);
  //   const selectors = createSelectors(selectorModules);
  //   const state = {
  //     a: {count: 3},
  //     b: {count: 666}
  //   };
  //
  //   expect(selectors.a.getCountOfA(state)).toBe(3);
  //   expect(selectors.getCountOfA(state)).toBe(3);
  //   expect(selectors.b.getCountOfB1(state)).toBe(666);
  //   expect(selectors.getCountOfB1(state)).toBe(666);
  //   expect(selectors.b.getCountOfB2(state)).toBe(4);
  //   expect(selectors.getCountOfB2(state)).toBe(4);
  // });

  test('selector of reselect should memorize', () => {
    const model = {
      namespace: 'a',
      selectors: ({ createSelector }) => ({
        getContent: createSelector(
          (state) => state.a.content,
          (content) => `content: ${content}`
        )
      })
    };
    const selectors = createSelectors(addSelectorModule(model, {}));
    selectors.getContent({ a: { content: '123456' } });
    expect(selectors.getContent.recomputations()).toBe(1);
    selectors.getContent({ a: { content: '123456' } });
    expect(selectors.getContent.recomputations()).toBe(1);
    selectors.getContent({ a: { content: '666' } });
    expect(selectors.getContent.recomputations()).toBe(2);
  });
});
