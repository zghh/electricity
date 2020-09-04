'use strict';

module.exports = app => {
  app.router.get('/api/currentUser', app.controller.user.currentUser);
  app.router.get('/api/queryCurrentOrders', app.controller.order.queryCurrentOrders);
  app.router.get('/api/queryMyOrders/:id', app.controller.order.queryMyOrders);
  app.router.post('/api/newOrder', app.controller.order.newOrder);
  app.router.get('/api/queryOrderInfo/:id', app.controller.order.queryOrderInfo);
  app.router.get('/api/queryTransactions/:id', app.controller.transaction.queryTransactions);
};