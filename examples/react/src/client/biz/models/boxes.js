import Immutable from 'seamless-immutable';
import * as types from '../types';

export default {
  // 支持 state 层级关系
  namespace: 'domains.boxes',
  state: Immutable({ key: 'b', some: '', entities: { '1': { id: '1', name: 'box-1' } } }),
  reducers: {
    [types.BOXES_PUT]: (state, { payload }) => state.merge(payload),
    [types.SOME_DO]: (state, { payload }) => state.set('some', payload)
  },

  // redux-actions 实现
  actions: {
    doSome: [types.SOME_DO],
    getOther: [
      types.OTHER_GET,
      undefined,
      () => ({ isFetch: true, isLatest: true, statusName: 'getOther' })
    ]
  },

  // 支持 reselect
  selectors: ({ createSelector, getSelector }) => {
    const getBoxes = (state) => state.domains.boxes;
    const getBoxEntities = createSelector(
      getSelector('domains.boxes.getBoxes'),
      (boxes) => boxes.entities
    );

    return { getBoxes, getBoxEntities };
  },

  // 全手动 sagas 模式，注入 effects ，actions ，selectors
  sagas: ({ takeLatest, select, put, all }, { actions, selectors }) => {
    const task1 = function* ({ type }) {
      console.log(`got ${type}`);
      // throw new Error('测试异常');
    };
    const task2 = function* ({ type }) {
      console.log(`got ${type}`);
    };

    return function* () {
      yield takeLatest('domains.boxes.task1', task1);
      yield takeLatest('domains.boxes.task2', task2);
      // yield all([
      //   takeLatest('domains.boxes.task1', task1),
      //   takeLatest('domains.boxes.task2', task2)
      // ]);
      // try {
      //   yield takeLatest('domains.boxes.task1', task1);
      //   yield takeLatest('domains.boxes.task2', task2);
      // } catch (error) {
      //   console.log('出现错误了！', error);
      // }
    };
  }
};
