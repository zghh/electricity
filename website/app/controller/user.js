'use strict'

const Controller = require('egg').Controller;

class UserController extends Controller {
  async currentUser() {
    const { ctx } = this;
    if (!ctx.isAuthenticated()) {
      ctx.status = 401;
    } else {
      ctx.body = this.ctx.user;
    }
  }

  async register() {
    const { ctx } = this;
    ctx.validate({
      id: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'int' },
      password: { type: 'string' },
    });
    const result = await ctx.service.user.register();
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }

  async queryUsers() {
    const { ctx } = this;
    if (!ctx.isAuthenticated() || ctx.user.role != 'admin') {
      ctx.status = 401;
      return;
    }
    const result = await ctx.service.user.queryUsers();
    ctx.body = result;
    if (!result.success) {
      ctx.status = 400;
    }
  }
}

module.exports = UserController;