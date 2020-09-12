'use strict';

const Service = require('egg').Service;
const roles = ['admin', 'normal', 'productive', 'traditional'];

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
        role: roles[result.data.type],
      }
    }
    return null;
  }

  async register() {
    const { ctx, config } = this;
    const { invokePeers, channelName, chaincodeName, orgName } = config.chain;
    const username = config.chain.admins[0].username;
    const user = ctx.request.body;
    const network = await ctx.service.chain.generateNetwork();
    const arg = JSON.stringify(user);
    return await ctx.invokeChainCode(network, invokePeers, channelName, chaincodeName, "register", [arg], username, orgName);
  }

  async queryUsers() {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryUsers', [], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
}

module.exports = UserService;