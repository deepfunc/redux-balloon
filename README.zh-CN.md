## redux-balloon

基于 [redux](https://github.com/reduxjs/redux)、[redux-saga](https://github.com/redux-saga/redux-saga)、[redux-actions](https://github.com/redux-utilities/redux-actions)、[reselect](https://github.com/reduxjs/reselect) 的轻量级前端业务层框架。(灵感来自于 `redux ducks style` 和 [DvaJS](https://dvajs.com/))



##  特性

- 基于 redux 社区最佳实践组合
- 基于 domain model 设计你的项目业务，优化文件组织方式
- 支持多 View 层框架使用（react、小程序 wepy 等）
- 简化 redux 相关配置，通过注入 actions、selectors、saga effects 方式减少 import 相关代码
- 动态加载 model（分包加载场景）
- 支持 reducers 增强（使用 [redux-persist](https://github.com/rt2zz/redux-persist) 持久化场景）

