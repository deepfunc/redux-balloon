# Redux Balloon API



## biz = balloon()

Create your business, return balloon instance:

```javascript
import balloon from 'redux-balloon';

const biz = balloon();
```



## biz.model(model)

Register business model. Model is a very important concept in balloon, a model includes some properties:

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

Model's namespace, property path of global state in redux. Support multilevel namespace by using `.`

```javascript
const model = {
  namespace: 'globals.loginInfo',
  // ...
};
```



### [state]

Initial value of model's state.

```javascript
const model = {
  namespace: 'globals.loginInfo',
  state: {},
  // ...
};
```

> You can organize Redux State Object as a tree.



### reducers

Define reducers as key/value object. key is type of some action.

> Finally, balloon will combines all model's reducers to make a global state of redux.

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

Define actions as key/value object, `value` is a string or an array. String or value[0] is type of an action, value[1] is `payloadCreator`, value[2] is `metaCreator`, value[1] or value[2] is optional.

> Actions in balloon are made by redux-actions. You can check this [documention](https://redux-actions.js.org/api/createaction#createactiontype-payloadcreator-metacreator) to see how to use payloadCreator and metaCreator.

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

After biz.run(), you can access model actions:

```javascript
// ...
biz.run();

biz.store.dispatch(biz.actions.login('username', 'xxxxxx'));

// or you can access it through propery path of namespace
// biz.store.dispatch(
//   biz.actions.globals.loginInfo.login('username', 'xxxxxx'));

```



#### return Promise after dispatch an action

Sometimes we may need to know the result of an asynchronous action. So you can define action like this:

```javascript
const model = {
  namespace: 'globals.loginInfo',
  // ...
  
  actions: {
    login: [
      'USER_LOGIN',
      undefined,
      
      // metaCreator returns an object has "isPromise" property
      () => ({ isPromise: true })
    ]
  },
  sagas: function ({...}) {    
    return {
      'USER_LOGIN': function* (action) {
      	const ret = yield call(api.login, {...});
        
        // after asynchronous processing, return the result
      	return ret;
      }
    };
  }
};

// ...
biz.store.dispatch(biz.actions.login(...)).then((ret) => {
  // successful result, you can show an successful message
}).catch((err) => {
  // failure
});
```





### [selectors]

Define selectors as a function. It should return an key/value object, key is single selector's name, value is a function.

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

After biz.run(), you can access model's selectors through biz.selectors:

```javascript
// ...
biz.run();

const state = biz.store.getState();
const loginInfo = biz.selectors.getLoginInfo(state));

// or you can access it it through namespace
// const loginInfo = biz.selectors.globals.loginInfo.getLoginInfo(state));
```



You can use [reselect](https://github.com/reduxjs/reselect) to memorize result as cache, all reselect's functions are treated as parameter injection.

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



You can also access other model's selectors in current model through `getSelector`.

> `getSelector(key)` is a lazy load function.

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

You can use [redux-saga](https://github.com/redux-saga/redux-saga) through `sagas` property. Usually, we use sagas to process asynchronous requests, or design business workflows. There are several ways to define sagas in balloon.



The first way, define sagas as key/value object, `key` is type of an action, `value` is an generator function or an array. If you use sagas to process asynchronous requests, this way will be convenient.

- When value is an function, will use `takeEvery` helper function
- When value is an array, first element is an generator function, the other is type of this helper function, type will be one of the following:
  - `takeEvery`
  - `takeLatest`
  - `throttle`

```javascript
import * as api from './api';

const model = {
  // ...
  sagas: {
    // takeEvery
    'SOME_GET': function* (action, { call, put }) {
      // saga effects are treated as parameter injection
      const ret = yield call(api.fetchSome);
      yield put({ type: 'SOME_PUT', payload: ret });
    },
    
    // takeLatest
    'OTHER_GET': [
      function* (
        action,
        { call, put, select },
        { ReduxSaga, getAction, getSelector }
      ) {
          // through the third parameter
          // you can use model's actions and selectors
          // and other redux-saga functions also
          const { delay } = ReduxSaga;
          yield delay(1000);

          const data = yield select(getSelector('getSomeData'));
          const ret = yield call(api.fetchOther, data);
          yield put(getAction('putOtherData')(ret));
      },
      { type: 'takeLatest' }
    ],
    
    // throttle
    '..._GET': [
      function* (...) {
        // ...
      },
      { type: 'throttle', ms: 1000 }
    ]
  }
};
```



The second way, define saga as a normal function, and return an key/value object. This way is similar like above, but injects parameters are in fixed place.

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



The third way, define sagas as a normal function, and return an generator function. Through this way, you can design your business workflow manually.

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

> If you use the third way to define sagas, you will manual processing something for an action which defined for support return Promise after dispatch.
>
> The `action` parameter of a saga function has _resolve() and  _reject() two functional property. After your business logic processing, you should invoke them.



## biz.run([opts])

After register all models, start balloon instance.

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

Initial state of global state, this will cover all model's initial state.

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

You can use Redux DevTools in Chrome like below:

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

If you want to use some redux middlewares:

```javascript
biz.run({
  // ...
  middlewares: [someMiddleware, otherMiddleware]
});
```



### [usePromiseMiddleware=true]

You can decide if you want to use this middleware of redux to support return Promise of dispath an action. The default value of this option is true. You can turn it off if you don't want to use it.



### [onSagaError]

When some sagas throw an error, you can handle it:

```javascript
biz.run({
  // ...
  onSagaError: (e, { namespace, key }) => {
    // if you define sagas as the third way, key will be undefined
    console.log(`catch a sagas error！namespace: ${namespace} key: ${key}`, e);
  }
});
```



> Although after run(), you can still dynamic register new model through biz.model(). 



## unmodel(namespace)

Unload model through namespace which is registered. It wil clear model's reducers, actions, selectors and cancel sagas.

```javascript
biz.unmodel('views.somePage');
```

