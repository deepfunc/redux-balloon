[English](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/README.md) | 简体中文



# Redux Balloon

基于 [redux](https://github.com/reduxjs/redux), [redux-saga](https://github.com/redux-saga/redux-saga), [redux-actions](https://github.com/redux-utilities/redux-actions), [reselect](https://github.com/reduxjs/reselect) 的轻量级前端框架。(灵感来自于 redux ducks style 和 DvaJS)

------

## 特性

- **基于 redux 社区最佳实践组成**（redux-saga、redux-actions、reselect）
- **Model 概念**：通过 `reducers`, `actions`, `selectors` 和 `sagas` 组织 model
- **优化业务文件碎片**：一个业务，一个单一的模型文件
- **灵活的 sagas 定义方式**
- **支持多种 UI 框架**：例如 `React` 和 `微信小程序（Wepy）`   

## 兼容性

支持现代浏览器和 IE9。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| IE9, IE10, IE11, Edge                                        | last 2 versions                                              | last 2 versions                                              | last 2 versions                                              |



## 入门指南

### 安装

```bash
$ npm install --save redux-balloon
```



### 使用范例

假设我们要做一个界面获取用户列表数据并且展示出来（使用 `react` 和 `react-redux`）。

#### `UserList.js`

```javascript
// ...
import biz from '../biz';

class UserList extends React.Component {
  componentDidMount() {
  	this.initData();
  }

  initData() {
    const {fetchUsers} = this.props;
    fetchUsers();
  }
  
  render() {
    const {users} = this.props;
    // 展示用户列表数据 ...
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



`biz` 是什么？这就是用 `redux-balloon` 来实现的业务代码。

#### `biz.js`

```javascript
import { balloon } from 'redux-balloon';
import * as types from './types';
import * as api from './api';

const users = {
  namespace: 'users',
  state: [],
  reducers: {
    [types.USERS_PUT]: (state, {payload}) => payload
  },
  actions: {
    fetchUsers: [types.USERS_GET]
  },
  selectors: () => ({
    getUsers: (state) => state.users
  }),
  sagas: {
    * [types.USERS_FETCH](action, {call, put}) {
      // 通过参数注入 saga effects。
      const users = yield call(api.fetchUsers);
      yield put({type: types.USERS_PUT, payload: users});
    }
  }
};

const biz = balloon();
biz.model(users);

biz.run();

export default biz;
```



为了让应用跑起来，我们需要配置入口。

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



你不需要 import redux, redux-saga（或者 redux-actions, reselect）到你的 js 文件中；你也不需要手动配置启动 redux 和连接 redux-saga。所以，如果你使用 redux 技术栈， 通过使用 `redux-balloon` 你可以用一种便捷的方式来编写业务层代码，并应用在多种 UI 层框架中。:smile:

## 文档

[API.md](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/docs/zh-cn/API.md)



## 完整示例

制作中...



## 更新日志

[CHANGELOG.md](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/CHANGELOG.md)



## 目录介绍

```
├── __tests__             - 单元测试
├── examples              - 使用示例
├── docs                  - 文档
├── src                   - 源码
└── CHANGELOG.md          - 更新日志
```



## 许可证

[MIT](https://tldrlegal.com/license/mit-license)



## 贡献者指南

[CONTRIBUTING.md](https://github.com/IAMSUPERMONKEY/redux-balloon/blob/master/CONTRIBUTING.md)

