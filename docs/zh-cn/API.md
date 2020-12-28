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
  actions: （{...}） => {...},
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
  state: {
    loginUserId: null,
    loginUsername: null
  },
  // ...
};
```

当使用 `.` 隔开名称空间用后，可按树形组织 Redux State 对象。如按上面的设置后 redux state 的结构如下：

```javascript
state = {
  globals: {
    loginInfo: {
      loginUserId: null,
      loginUsername: null
    }
  }
}
```



#### 支持合并父、子 model 的 state

```javascript
const parentModel = {
  namespace: 'parent',
  state: { a: 1 },
  // ...
};
const childModel = {
  namespace: 'parent.child',
  state: { b: 1 },
  // ...
};

biz.model(parentModel).model(childModel).run();
console.log(biz.getState());
/*
  parent: {
  	a: 1,
  	child: { b: 1 }
  }
/*
```

state 合并与 model 的加载顺序无关；如果父 state 里有属性与子名称空间 key 同名，则被子 state 覆盖。



### reducers

定义 reducers 为 key/value 对象，key 是某个 action 的 type 属性。最终会根据各个名称空间下 Model 的 reducers 将状态汇总为整个 redux 全局 state。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {
    loginUserId: null,
    loginUsername: null
  },
  reducers: {
    ['LOGIN_INFO_PUT']: (state, { payload }) => payload,
    ['LOGIN_INFO_CLEAR']: () => ({})
  }
};
```

注意，每个 model 下 reducers 接收和需要返回的仅是自身 model 的状态，不是整个 redux 状态。reducers 的实现基于 `combineReducers` 和 `redux-actions` 的 [handleActions](https://redux-actions.js.org/api/handleaction#handleactionsreducermap-defaultstate)。



### [actions]

actions 定义为一个函数，返回一个 key/value 对象， `value` 可以是一个字符串或是一个数组。字符串或 value[0] 是某个 action 的 type，value[1] 是 `payloadCreator`，value[2] 是 `metaCreator`，value[1] 和 value[2] 是可选的。

Balloon 使用 `redux-actions` 来创建 actions，有一些概念比如 payload 请先了解下。你可以看看 [文档](https://redux-actions.js.org/api/createaction#createactiontype-payloadcreator-metacreator) 中是如何使用 `payloadCreator` 和 `metaCreator` 的。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {
    loginUserId: null,
    loginUsername: null
  },
  reducers: {
    ['LOGIN_INFO_PUT']: (state, { payload }) => payload,
    ['LOGIN_INFO_CLEAR']: () => ({})
  },
  actions: () => ({
    login: 'USER_LOGIN'
  })
};
```

执行 biz.run() 后，就可以访问 Model 的 actions 了:

```javascript
// ...
biz.run();

biz.store.dispatch(biz.actions.login('username', 'xxxxxx'));
```



#### ApiAction 和 PromiseAction

在实际开发中，我们经常会发起一个 action 来调用后台接口，这个场景频率很高。所以我抽象出了 `ApiAction` 和 `PromiseAction` 这两个常用的 action 和对应功能的支持。这两个特殊的 action 都是异步的支持 Promise 接口，他们的实现依赖于 Redux 中间件。



##### ApiAction

针对 api 的调用场景，我编写了一个单独的 `apiModel` 来处理对应的场景。首先在启动的时候配置 api 对象：

```javascript
biz.run({
  apiModel: {
    apiMap: {
      // apiMap 是一个对象 Map，key 请设置为对应 api action 的 type，
      // value 是指定的 api 接口函数。
      ['SOME_TYPE']: async function (payload) {
        // 调用这个 action 时传递的 payload 将会传递给 api 接口函数。
        // ...
      }
    }
  }
});
```

在编写 model 的 actions 时，使用 `defApiAction` 来定义：

```javascript
const someModel = {
  // ...
  actions: ({ defApiAction }) => ({
    doSomething: defApiAction('SOME_TYPE')
  })
};
```



当 dispatch 这个 api action 后，返回结果是个 Promise，并且当 api 函数调用成功后，会发起 type 为 `*_SUCCESS` 的 action，调用出现异常时会发起 type 为 `*_FAILED` 的 action，reducers 和 sagas 可以根据需要处理。



##### PromiseAction

通过以下设置开启 PromiseAction 的支持：

```javascript
biz.run({
  usePromiseMiddleware: true
});
```

在编写 model 的 actions 时，使用 `defPromiseAction` 来定义：

```javascript
const someModel = {
  // ...
  actions: ({ defPromiseAction }) => ({
    doSomething: defPromiseAction('SOME_TYPE')
  })
};
```



当 dispatch promise action 后，返回的结果是 Promise。注意生成的这个 action 对象在后续的中间件中收到时将包含 `_resolve` 和 `_reject` 两个函数，用来决议这个 promise action 的结果。后面说到 sagas 再详细介绍 promise action 的决议过程。



### [selectors]

selectors 定义为一个函数， 函数值返回一个 key/value 对象， key 是单个 selector 的名字, value 是需要定义的 selector 函数。

需要注意的是，selector 函数的参数 state 表示的是这个 model 的 state，不是整个 redux 的状态。

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {
    loginUserId: null,
    loginUsername: null
  },
  reducers: {
    ['LOGIN_INFO_PUT']: (state, { payload }) => payload,
    ['LOGIN_INFO_CLEAR']: () => ({})
  },
  actions: () => ({
    login: 'USER_LOGIN'
  }),
  selectors: () => ({
  	getLoginUserName: (state) => state.loginUsername
  })
};
```

执行 biz.run() 后，你可以通过 biz.selectors 访问模型定义的 selectors：

```javascript
// ...
biz.run();

const state = biz.store.getState();
const loginInfo = biz.selectors.getLoginUserName(state));
```



你可以通过 [reselect](https://github.com/reduxjs/reselect) 缓存计算的结果，reselect 的所有功能将通过参数注入使用。

```javascript
import moment from 'moment';

const model = {
  namespace: 'globals.loginInfo',
  // ...
  selectors: ({ createSelector }) => {
    const getLoginInfo = createSelector(
      state => state,
      loginInfo => Object.assign({}, loginInfo, {
        loginTime: moment(userInfo.loginTime).format('MMMM Do YYYY, h:mm:ss a')
      })
    );
    
    return { getLoginInfo };
  }
};
```



你也可以通过 `getSelector(selectorName)` 访问其他 model 定义的 selectors，`getSelector` 是一个懒加载函数。

```javascript
const model = {
  namespace: 'views.somePage',
  // ...
  selectors: ({ createSelector, getSelector }) => {
    const getAllInfo = createSelector(
      state => state,
      getSelector('getOtherInfo'),
      (someInfo, otherInfo) => ({ someInfo, otherInfo })
    );
    
    return { getAllInfo };
  }
};
```



### [sagas]

你可以通过定义 `sagas` 属性来使用 [redux-saga](https://github.com/redux-saga/redux-saga) 的相关功能。通常我们使用 sagas 来处理异步任务和设计自己的业务工作流。这里提供了几种定义 sagas 的方式。



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



第二种方式, 定义 saga 为一个普通的函数，并返回一个 key/value 对象。这种方式与前面一种类似，但是参数注入的地方是统一的，如下所示：

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



#### getAction 和 getSelector

有时我们需要使用 model 中定义的 action 或者 selector。在 sagas 定义中注入的第二个参数对象，解构后有两个函数 `getAction` 和 `getSelector`，这两个函数以 model 中定义的 action key 和 selector key 作为参数，在 saga 函数通过调用这两个函数可以获得当前 model 或者其他 model 中定义的 action 和 selector。



#### PromiseAction

还记得前面介绍的 promise action 吗？如果在 sagas 中采用前两种定义方式的话，Balloon 将在对应 saga 函数处理完毕后自动调用 `_resove`，参数是 saga 函数的返回值；如果 saga 函数执行中产生异常，将调用 `_reject`，参数是捕捉到的异常。

如果采用最后一种方式定义 sagas 的话，你需要手动处理 promise action 的决议。传递给 saga 处理函数的 action 对象将具有 `_resolve` 和 `_reject` 两个函数属性，在适当的时候调用即可。



## biz.run([opts])

注册所有 model 后，启动 balloon 实例。

```javascript
biz.run({
  // devtools: ...,
  // middlewares: [...],
  // apiModel: {...},
  // usePromiseMiddleware: true,
  // onSagaError: ...,
  // onEnhanceReducer: ...,
  // onEnhanceStore: ...
});

const { store, actions, selectors } = biz;
const state = store.getState();
const loginInfo = selectors.getLoginInfo(state);
store.dispatch(actions.getSome());
```

执行 run() 后，你仍然可以通过 biz.model() 注册新的 model 并立即应用，这种场景对应于延迟加载业务层代码。 



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



### [usePromiseMiddleware]

是否使用这个中间件来支持使用 `PromiseAction`。如果启用了 `apiModel`，这个选项是强制开启的。



### [apiModel]

```javascript
biz.run({
  apiModel: {
    apiMap: {...}, // 自定义的 api 对象 map，key 是 action type。
    namespace: 'api' // apiModel 名称空间，默认值是 'api'，不想改就不用设置。
  }
});
```

前面已经介绍过 apiModel 的使用，这里补充一下 apiModel 的其他细节。apiModel 是有状态的，状态主要是记录每个 api action 调用时的状态描述：

```javascript
state: {
  /**
    * [apiName]: { status: '...', error: {...} }
    * ...
    */
}
```

`status` 属性的内容是当前 api 的调用状态，值有 4 个：

- `IDLE`，空闲状态
- `LOADING`，正在调用状态
- `SUCCESS`，调用成功
- `FAILURE`，调用失败

当出现调用失败时，在额外的 error 属性中将包含产生的异常。



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



## unmodel(namespace)

通过名称空间卸载已注册的 model。这会清除 model 的 reducers、actions、selectors 和终止 sagas。

```javascript
biz.unmodel('views.somePage');
```

