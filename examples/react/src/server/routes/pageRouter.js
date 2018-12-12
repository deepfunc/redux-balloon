const Router = require('koa-router');

const pageRouter = new Router();

const pagePath = [
  '/',
  '/userManagement'
];

pageRouter.get(pagePath, async ctx => {
  await ctx.render('app');
});

module.exports = pageRouter;
