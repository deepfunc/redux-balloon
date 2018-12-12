import balloon from 'redux-balloon';
import userManagement from './models/userManagement';

const biz = balloon();
biz.model(userManagement);

let devtools = undefined;
if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  devtools = devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS);
}

biz.run({
  devtools
});

export default biz;
