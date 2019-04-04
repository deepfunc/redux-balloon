# Redux Balloon API



## biz = balloon()

创建应用，返回 balloon 实例:

```javascript
import balloon from 'redux-balloon';

const biz = balloon();
```



## biz.model(model)

注册业务 model。Model 是 balloon 中最重要的概念， 一个 model 将会包含以下属性：

```javascript
biz.model({
  namespace: '...',
  state: {...},
  reducers: {...},
  actions: {...},
  selectors: ({...}) => {...},
  sagas: {...}
});
```



### namespace

Model 的名称空间，也是在 redux 全局 state 上的属性路径。支持用 `.` 创建多层名称空间。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  // ...
};
```



### [state]

Model 的 state 初始值。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {},
  // ...
};
```

> 可按树形组织 Redux State 对象。



### reducers

定义 reducers 为 key/value 对象，key 是某个 action 的 type 属性。

> 最终 balloon 会根据各个名称空间下 Model 的 reducers 将状态汇总为整个 redux 全局 state。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {},
  reducers: {
    ['LOGIN_INFO_PUT']: (state, { payload }) => payload,
    ['LOGIN_INFO_CLEAR']: () => ({})
  }
};
```



### [actions]

定义 actions 为 key/value 对象， `value` 可以是一个字符串或是一个数组. 字符串或 value[0] 是某个 action 的 type，value[1] 是 `payloadCreator` 函数, value[2] 是 `metaCreator` 函数, value[1] 或 value[2] 是可选的。

> Balloon 使用 redux-actions 来创建 actions。你可以看看 [文档](https://redux-actions.js.org/api/createaction#createactiontype-payloadcreator-metacreator) 中是如何使用payloadCreator 和 metaCreator的。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {},
  reducers: {
    ['LOGIN_INFO_PUT']: (state, { payload }) => payload,
    ['LOGIN_INFO_CLEAR']: () => ({})
  },
  actions: {
    login: 'USER_LOGIN'
  }
};
```

执行 biz.run() 过后，你就可以访问 Model 的 actions 了:

```javascript
// ...
biz.run();

biz.store.dispatch(biz.actions.login('username', 'xxxxxx'));

// 或者你也可以通过名称空间的属性路径来访问
// biz.store.dispatch(
//   biz.actions.globals.loginInfo.login('username', 'xxxxxx'));

```



#### 支持 dispatch 一个 action 后返回 Promise

有时候在 view 层我们会需要知道 action 的异步执行结果，那么在定义 action 的时候支持返回 Promise 方式：

```javascript
const model = {
  namespace: 'globals.loginInfo',
  // ...
  
  actions: {
    login: [
      'USER_LOGIN',
      undefined,
      
      // metaCreator 返回对象具有 isPromise=true 属性
      () => ({ isPromise: true })
    ]
  },
  sagas: function ({...}) {    
    return {
      'USER_LOGIN': function* (action) {
      	const ret = yield call(api.login, {...});
        
        // 异步处理完返回结果
      	return ret;
      }
    };
  }
};

// ...
biz.store.dispatch(biz.actions.login(...)).then((ret) => {
  // 执行成功返回结果, 弹个成功提示框什么的
}).catch((err) => {
  // 执行失败
});
```





### [selectors]

定义 selectors 为一个函数。 函数值返回一个 key/value 对象， key 是单个 selector 的名字, value 是函数。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {},
  reducers: {
    ['LOGIN_INFO_PUT']: (state, { payload }) => payload,
    ['LOGIN_INFO_CLEAR']: () => ({})
  },
  actions: {
    login: 'USER_LOGIN'
  },
  selectors: () => ({
  	getLoginInfo: (state) => state.globals.loginInfo
  })
};
```

执行 biz.run() 后，你可以通过 biz.selectors 访问模型定义的 selectors：

```javascript
// ...
biz.run();

const state = biz.store.getState();
const loginInfo = biz.selectors.getLoginInfo(state));

// 或者你也可以通过名称空间访问
// const loginInfo = biz.selectors.globals.loginInfo.getLoginInfo(state));
```



你可以通过 [reselect](https://github.com/reduxjs/reselect) 缓存计算的结果，reselect 的所有功能将通过参数注入使用。

```javascript
import moment from 'moment';

const model = {
  namespace: 'globals.loginInfo',
  // ...
  selectors: ({ createSelector }) => {
    const getLoginInfo = createSelector(
      (state) => state.state.globals.loginInfo,
      (loginInfo) => Object.assign({}, loginInfo, {
        loginTime: moment(userInfo.loginTime).format('MMMM Do YYYY, h:mm:ss a')
      })
    );
    
    return { getLoginInfo };
  }
};
```



你也可以通过 `getSelector` 访问其他 model 定义的 selectors。

> `getSelector(key)`是一个懒加载函数。

```javascript
const model = {
  namespace: 'views.somePage',
  // ...
  selectors: ({ createSelector, getSelector }) => {
    const getAllInfo = createSelector(
      (state) => views.somePage.someInfo,
      getSelector('views.otherPage.getOtherInfo'),
      (someInfo, otherInfo) => ({ someInfo, otherInfo })
    );
    
    return { getAllInfo };
  }
};
```



### [sagas]

你可以通过定义 `sagas` 属性来使用 [redux-saga](https://github.com/redux-saga/redux-saga) 的相关功能。通常我们使用 sagas 来处理异步任务和设计自己的业务工作流。Balloon 提供了几种定义 sagas 的方式。



第一种方式，定义 sagas 为 key/value 对象，`key` 是某个 action 的 type，`value` 是生成器函数或一个数组。如果你使用 sagas 来处理异步任务，这种定义方式比较简便。

- 当定义 value 为生成器函数时，默认使用 `takeEvery` helper
- 当定义 value 为数组时，第一个元素是生成器函数，另一个是使用 helper 的 type 设置，type 可以使用以下这些值：
  - `takeEvery`
  - `takeLatest`
  - `throttle`

```javascript
import * as api from './api';

const model = {
  // ...
  sagas: {
    // 这是 takeEvery
    'SOME_GET': function* (action, { call, put }) {
      // saga effects 将通过参数注入
      const ret = yield call(api.fetchSome);
      yield put({ type: 'SOME_PUT', payload: ret });
    },
    
    // 这是 takeLatest
    'OTHER_GET': [
      function* (
        action,
        { call, put, select },
        { ReduxSaga, getAction, getSelector }
      ) {
          // 通过第三个参数，你可以使用 model 定义的 actions 和 selectors
          // 或者也可以使用 redux-saga 其他的功能函数
          const { delay } = ReduxSaga;
          yield delay(1000);

          const data = yield select(getSelector('getSomeData'));
          const ret = yield call(api.fetchOther, data);
          yield put(getAction('putOtherData')(ret));
      },
      { type: 'takeLatest' }
    ],
    
    // 这是 throttle
    '..._GET': [
      function* (...) {
        // ...
      },
      { type: 'throttle', ms: 1000 }
    ]
  }
};
```



第二种方式, 定义 saga 为一个普通的函数，并返回一个 key/value 对象。这种方式与前面一种类似，但是参数注入的地方是固定的，如下所示：

```javascript
import * as api from './api';

const model = {
  // ...
  sagas: function ({ select, put, call }, { ReduxSaga, getAction, getSelector }) {
    const { delay } = ReduxSaga;
    
    return {
      'SOME_GET': function* (action) {
      	const ret = yield call(api.fetchSome);
      	yield put({type: 'SOME_PUT', payload: ret});
      },
      
      'OTHER_GET': [
        function* (action) {
          yield delay(1000);

          const data = yield select(getSelector('getSomeData'));
          const ret = yield call(api.fetchOther, data);
          yield put(getAction('putOtherData')(ret));
        },
        { type: 'takeLatest' }
      ]
    };
  }
};
```



最后，第三种方式，定义 sagas 为普通函数，然后返回一个生成器函数。通过这种方式，你可以手动定义业务工作流。

```javascript
import * as api from './api';

const model = {
  // ...
  sagas: function ({ takeLatest, select, put, call },
                   { ReduxSaga, getAction, getSelector }) {
    const { delay } = ReduxSaga;
    
    const handleGetSome = function* (action) {
      yield delay(1000);

      const data = yield select(getSelector('getSomeData'));
      const ret = yield call(api.fetchOther, data);
      yield put(getAction('putOtherData')(ret));
    };
    
    return function* () {
      yield takeLatest('SOME_GET', handleGetSome);
    };
  }
};
```

> 注意如果采用这种方式定义 sagas，处理支持 Promise 方式的 action 时需要手动调用完成。
>
> 传递给 saga 处理函数的 action 对象将具有 _resolve() 和 _reject() 两个函数属性，处理完业务逻辑调用即可。



## biz.run([opts])

注册所有 model 后，启动 balloon 实例。

```javascript
biz.run({
  // initialState: {...},
  // devtools: ...,
  // middlewares: [...],
  // usePromiseMiddleware: true,
  // onSagaError: ...,
  // onEnhanceReducer: ...
});

const { store, actions, selectors } = biz;
const state = store.getState();
const loginInfo = selectors.getLoginInfo(state);
store.dispatch(actions.getSome());
```



### [initialState]

全局 state 的初始状态，这会覆盖 models 里面的对应设置。

```javascript
const initialState = {
  globals: {
      loginInfo: {
        name: 'xxx',
        // ...
      }
    }
};

biz.run({
  initialState,
  // ...
});
```



### [devtools]

你可以参照下面代码示例使用 Redux DevTools in Chrome：

```javascript
// ...

let devtools = undefined;
if (process.env.NODE_ENV === 'development' &&
    window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  devtools = devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS);
}

biz.run({
  // ...
  devtools
});
```



### [middlewares]

如果你要使用一些 redux 中间件的话可以像下面这样去设置：

```javascript
biz.run({
  // ...
  middlewares: [someMiddleware, otherMiddleware]
});
```



### [usePromiseMiddleware=true]

是否使用这个中间件来支持 dispatch 一个 action 时返回 Promise。这个选项默认是开启的，不需要使用的时候可以手动关闭。



### [onSagaError]

当某些 sagas 抛出异常时，可以在这里进行全局捕获：

```javascript
biz.run({
  // ...
  onSagaError: (e, { namespace, key }) => {
    // if you define sagas as the third way, key will be undefined
    console.log(`catch a sagas error！namespace: ${namespace} key: ${key}`, e);
  }
});
```



> 执行 run() 后，你仍然可以通过 biz.model() 注册新的 model并立即应用。 



## unmodel(namespace)

通过名称空间卸载已注册的 model。这会清除 model 的 reducers、actions、selectors 和终止 sagas。

```javascript
biz.unmodel('views.somePage');
```

