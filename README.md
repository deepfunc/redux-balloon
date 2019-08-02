English | [简体中文](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/README.zh-CN.md)



# Redux Balloon

[![npm version](https://img.shields.io/npm/v/redux-balloon)](https://badge.fury.io/js/redux-balloon)
[![Build Status](https://travis-ci.org/IAMSUPERMONKEY/redux-balloon.svg?branch=master)](https://travis-ci.org/IAMSUPERMONKEY/redux-balloon)
[![Coverage Status](https://coveralls.io/repos/github/IAMSUPERMONKEY/redux-balloon/badge.svg?branch=master)](https://coveralls.io/github/IAMSUPERMONKEY/redux-balloon?branch=master)
[![Dependencies Status](https://david-dm.org/IAMSUPERMONKEY/redux-balloon.svg)](https://david-dm.org/IAMSUPERMONKEY/redux-balloon)

Lightweight front-end business framework based on [redux](https://github.com/reduxjs/redux), [redux-saga](https://github.com/redux-saga/redux-saga), [redux-actions](https://github.com/redux-utilities/redux-actions), [reselect](https://github.com/reduxjs/reselect).(Inspired by redux ducks style and DvaJS)

---



## Features

- **Based on redux community best practices** (redux-saga, redux-actions, reselect, etc.)
- **Model concepts**: organize model with `reducers`, `actions`, `selectors` and `sagas`
- **You can organize Redux State Object as a tree**
- **Optimize file fragmentation**: one business, one model file
- **Define sagas of model flexibility**
- **Support multiple UI frameworks**: e.g., `React` and `Wechat Mini Program(WePY)`   



## Browsers support

Modern browsers and IE9.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE9, IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions |



## Getting started

### Install

```bash
$ npm install --save redux-balloon
```



### Usage Example

Suppose we have a UI to fetch user data and display them (use `react` and `react-redux`).

#### `UserList.js`

```javascript
// ...
import biz from '../biz';

class UserList extends React.Component {
  componentDidMount() {
  	this.initData();
  }

  initData() {
    const { fetchUsers } = this.props;
    fetchUsers();
  }
  
  render() {
    const { users } = this.props;
    // display users data ...
  }
}
  
const mapStateToProps = (state) => ({
    users: biz.selectors.getUsers(state)
});

const mapDispatchToProps = {
    fetchUsers: biz.actions.fetchUsers
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
```



What is `biz` ? It is our business code by using `redux-balloon`.

#### `biz.js`

```javascript
import balloon from 'redux-balloon';
import * as types from './types';
import * as api from './api';

const users = {
  namespace: 'users',
  state: [],
  reducers: {
    [types.USERS_PUT]: (state, { payload }) => payload
  },
  actions: {
    fetchUsers: types.USERS_GET
  },
  selectors: () => ({
    getUsers: (state) => state.users
  }),
  sagas: {
    * [types.USERS_FETCH](action, { call, put }) {
      // saga effects are treated as parameter injection.
      const users = yield call(api.fetchUsers);
      yield put({ type: types.USERS_PUT, payload: users });
    }
  }
};

const biz = balloon();
biz.model(users);

biz.run();

export default biz;
```



To run our app, we'll connect it.

#### `app.js`

```javascript
// ...
import biz from './biz';
import UserList from './components/UserList';

const App = () => {
  return (
    <Provider store={biz.store}>
      <UserList/>
    </Provider>
  );
};

ReactDOM.render(<App/>, document.getElementById('app'));
```



You don't need to import redux, redux-saga (and redux-actions, reselect) in your js files; and you don't need initialize redux or redux-saga. By using `redux-balloon`, you can write business codes in easy way and run them in some different UI frameworks. :smile:



## Documentation

[API.md](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/docs/en/API.md)



## Complete Examples

[React example](https://github.com/IAMSUPERMONKEY/redux-balloon/tree/master/examples/react)

WePY example making...



## Change Log

[CHANGELOG.md](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/CHANGELOG.md)



## Directory

```
├── __tests__             - unit tests
├── examples              - how to use it
├── docs                  - documents
├── src                   - source codes
└── CHANGELOG.md          - change log
```



## License

[MIT](https://tldrlegal.com/license/mit-license)



## Contribution Guide

[CONTRIBUTING.md](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/CONTRIBUTING.md)

