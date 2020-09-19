'use strict';

const Controller = require('egg').Controller;

class ChainController extends Controller {
  async getBlocks() {
    const { ctx } = this;
    const result = await ctx.service.chain.getBlocks(parseInt(ctx.params.start), parseInt(ctx.params.end));
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
}

module.exports = ChainController;