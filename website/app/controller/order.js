'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  async queryCurrentOrders() {
    const { ctx } = this;
    if (!ctx.isAuthenticated()) {
      ctx.status = 401;
      return;
    }
    const result = await ctx.service.order.queryCurrentOrders();
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
  async queryMyOrders() {
    const { ctx } = this;
    if (!ctx.isAuthenticated()) {
      ctx.status = 401;
      return;
    }
    const result = await ctx.service.order.queryMyOrders(ctx.params.id);
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
  async newOrder() {
    const { ctx } = this;
    ctx.validate({
      userId: { type: 'string' },
      type: { type: 'string' },
      energyType: { type: 'string' },
      price: { type: 'int' },
      amount: { type: 'int' },
    });
    const result = await ctx.service.order.newOrder();
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
  async queryOrderInfo() {
    const { ctx } = this;
    if (!ctx.isAuthenticated()) {
      ctx.status = 401;
      return;
    }
    const result = await ctx.service.order.queryOrderInfo(ctx.params.id);
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
}

module.exports = OrderController;