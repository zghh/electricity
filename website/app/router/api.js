'use strict';

module.exports = app => {
  app.router.get('/api/currentUser', app.controller.user.currentUser);
  app.router.post('/api/register', app.controller.user.register);
  app.router.get('/api/queryCurrentOrders', app.controller.order.queryCurrentOrders);
  app.router.get('/api/queryMyOrders/:id', app.controller.order.queryMyOrders);
  app.router.post('/api/newOrder', app.controller.order.newOrder);
  app.router.get('/api/queryOrderInfo/:id', app.controller.order.queryOrderInfo);
  app.router.get('/api/queryTransactions/:id', app.controller.transaction.queryTransactions);
  app.router.get('/api/queryUsers', app.controller.user.queryUsers);

  app.router.get('/api/v1/orders/current', app.controller.order.getCurrentOrders);  // 查询当前订单
  app.router.get('/api/v1/orders/all', app.controller.order.getAllOrders); // 查询所有订单
  app.router.get('/api/v1/orders/:id', app.controller.order.getOrders); // 查询用户所有订单
  app.router.post('/api/v1/order', app.controller.order.addOrder); // 添加订单
  app.router.get('/api/v1/order/:id', app.controller.order.getOrderInfo); // 查询订单详情
  app.router.get('/api/v1/transactions/all', app.controller.transaction.getAllTransactions); // 查询所有交易
  app.router.get('/api/v1/transactions/time/:startTime/:endTime', app.controller.transaction.getTransactionsByTime); // 查询某段时间内的交易
  app.router.get('/api/v1/transactions/:id', app.controller.transaction.getTransactions); // 查询用户所有交易
  app.router.get('/api/v1/chain/blocks/:start/:end', app.controller.chain.getBlocks); // 查询区块内容
  app.router.get('/api/v1/chain/info', app.controller.chain.getInfo); // 查询区块链信息
};
