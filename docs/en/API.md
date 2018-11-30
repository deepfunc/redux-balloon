# Redux Balloon API



## biz = balloon()

Return business instance:

```javascript
import { balloon } from 'redux-balloon';

const biz = balloon();
```



## biz.model(model)

Register business model. Model is a very important concept. A model includes some properties:

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

Model's namespace. Support multilevel namespace by using `'.'`:

```javascript
const model = {
  namespace: 'globals.userInfo',
  // ...
};
```



### [state]

Initial value of model's state.

```javascript
const model = {
  namespace: 'globals.userInfo',
  state: {},
  // ...
}
```





### reducers

Define `redux reducer` as key/value object. `key` is type of an action:

```javascript
const model = {
  namespace: 'globals.userInfo',
  state: {},
  reducers: {
    ['USER_INFO_PUT']: (state, {payload}) => payload,
    ['USER_INFO_CLEAR']: () => ({})
  }
}
```

