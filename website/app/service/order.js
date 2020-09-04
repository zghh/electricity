'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
  async queryCurrentOrders() {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryCurrentOrders', [], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
  async queryMyOrders(id) {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryMyOrders', [id], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
  async newOrder() {
    const { ctx, config } = this;
    const { invokePeers, channelName, chaincodeName, orgName } = config.chain;
    const username = config.chain.admins[0].username;
    const order = ctx.request.body;
    let fcn = "";
    if (order.type === 'seller') {
      order.type = 1;
      fcn = "submitSellerOrder";
    } else {
      order.type = 2;
      fcn = "submitBuyerOrder";
    }
    const network = await ctx.service.chain.generateNetwork();
    const arg = JSON.stringify(order);
    return await ctx.invokeChainCode(network, invokePeers, channelName, chaincodeName, fcn, [arg], username, orgName);
  }
  async queryOrderInfo(id) {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryOrderInfo', [id], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
}

module.exports = OrderService;
