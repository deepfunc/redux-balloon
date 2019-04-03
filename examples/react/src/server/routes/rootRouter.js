const Router = require('koa-router');
const userManagementRouter = require('./userManagementRouter');

const rootRouter = new Router();

rootRouter.use(
  '/api/userManagement',
  userManagementRouter.routes(),
  userManagementRouter.allowedMethods()
);

module.exports = rootRouter;
