import balloon from 'redux-balloon';

const biz = balloon();

const modelContext = require.context('./models', true, /\.js$/);
modelContext.keys().forEach((key) => biz.model(modelContext(key).default));

let devtools = undefined;
if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  devtools = devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS);
}

biz.run({
  devtools
});

export default biz;
