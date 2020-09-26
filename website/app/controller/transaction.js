'use strict';

const Controller = require('egg').Controller;

class TransactionController extends Controller {
  async queryTransactions() {
    const { ctx } = this;
    if (!ctx.isAuthenticated()) {
      ctx.status = 401;
      return;
    }
    const result = await ctx.service.transaction.queryTransactions(ctx.params.id);
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }

  async getTransactions() {
    const { ctx } = this;
    const result = await ctx.service.transaction.queryTransactions(ctx.params.id);
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
  async getAllTransactions() {
    const { ctx } = this;
    const result = await ctx.service.transaction.queryALLTransactions();
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
  async getTransactionsByTime() {
    const { ctx } = this;
    const result = await ctx.service.transaction.queryTransactionsByTime(ctx.params.startTime, ctx.params.endTime);
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
}

module.exports = TransactionController;