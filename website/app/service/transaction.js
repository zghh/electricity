'use strict';

const Service = require('egg').Service;

class TransactionService extends Service {
  async queryTransactions(id) {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryTransactions', [id], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
  async queryALLTransactions() {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryTransactionsByTime', [], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
  async queryTransactionsByTime(startTime, endTime) {
    const { ctx, config } = this;
    const { queryPeer, channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryChainCode(network, queryPeer, channelName, chaincodeName, 'queryTransactionsByTime', [startTime, endTime], username);
    if (result.success) {
      result.data = JSON.parse(result.data);
    }
    return result;
  }
}

module.exports = TransactionService;
