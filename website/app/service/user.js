'use strict';

const Service = require('egg').Service;
const roles = ['普通消费者', '生产消费者', '传统能源公司'];

class UserService extends Service {
  async login(user) {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const network = await ctx.service.chain.generateNetwork();
    const adminUsername = config.chain.admins[0].username;
    const username = user.username;
    const password = user.password;
    const arg = JSON.stringify({
      id: username,
      password: password,
    });
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'login', [arg], adminUsername);
    if (result.success) {
      result.data = JSON.parse(result.data);
      return {
        id: username,
        username: result.data.name,
        role: roles[result.data.type - 1],
      }
    }
    return null;
  }
}

module.exports = UserService;