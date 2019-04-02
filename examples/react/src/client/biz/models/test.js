export default {
  namespace: 'test',
  sagas: ({ takeEvery }) => {
    function* handleTest(arg1, action) {
      // throw new Error('handleTest error');
      // console.log('handleTest', arg1, action);
    }

    return function* () {
      yield takeEvery('TEST_DO', handleTest, 666);
      // throw new Error('test error');
    };
  }
};
