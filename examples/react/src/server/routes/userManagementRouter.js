const Router = require('koa-router');

const userManagementRouter = new Router();
let userTable = [];

function initUserTable() {
  userTable = [];
  const data = [
    { userName: 'William W Palacios', age: 27, sex: 'male', address: '4091 Franklin Avenue' },
    { userName: 'Joan J Martin', age: 32, sex: 'female', address: '4594 Clay Street' },
    { userName: 'Becky C Runyon', age: 36, sex: 'female', address: '1885 Ashton Lane' },
    { userName: 'Debra R Boone', age: 21, sex: 'female', address: '3120 Aaron Smith Drive' },
    { userName: 'Eric E Duke', age: 37, sex: 'male', address: '503 Felosa Drive' },
    { userName: 'Deborah D Blevins', age: 50, sex: 'male', address: '3711 Hillside Drive' },
    { userName: 'Keith T Robinson', age: 20, sex: 'male', address: '2104 Oral Lake Road' },
    { userName: 'Cesar C Hillman', age: 42, sex: 'male', address: '1396 Jefferson Stree' },
    { userName: 'Marcel M Flournoy', age: 23, sex: 'male', address: '1905 Concord Street' }
  ];
  for (let i = 1; i <= 64; i++) {
    const randomUser = data[getRandomInt(0, data.length)];
    const user = {
      id: i,
      ...randomUser
    };
    userTable.push(user);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

initUserTable();

userManagementRouter.post('/getTableData', async ctx => {
  const { paging: { current, pageSize }, keywords } = ctx.request.body;
  const begin = (current - 1) * pageSize;
  const items = userTable.slice(begin, begin + pageSize);
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 500);
  });
  ctx.body = ctx.responseUtil.returnSuccess({ items, total: userTable.length });
});

module.exports = userManagementRouter;
