import balloon from 'redux-balloon';
import userManagement from './models/userManagement';
import test from './models/test';

const biz = balloon();
biz.model(test);
biz.model(userManagement);

let devtools = undefined;
if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  devtools = devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS);
}

biz.run({
  devtools,
  onSagaError: (err) => {
    console.log('onSagaError', err);
  }
});

setTimeout(() => biz.store.dispatch({ type: 'TEST_DO' }), 1000);
// setTimeout(() => biz.store.dispatch({ type: 'TEST_DO' }), 3000);

export default biz;
