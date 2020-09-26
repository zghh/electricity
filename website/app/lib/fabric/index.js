'use strict';

const hfc = require('fabric-client');
const fs = require('fs-extra');
const util = require('util');
let checkingHealthy = false;

module.exports = app => {

  function setupPeers(network, channel, client) {
    for (const key in network.peers) {
      let data = fs.readFileSync(network.peers[key].tlsCACerts.path);
      let peer = client.newPeer(network.peers[key].url,
        {
          pem: Buffer.from(data).toString(),
          'ssl-target-name-override': network.peers[key].grpcOptions['ssl-target-name-override']
        }
      );
      peer.setName(key);
      channel.addPeer(peer);
    }
  }

  async function getClientForOrg(network, username) {
    const client = hfc.loadFromConfig(network);
    client.loadFromConfig(network);

    await client.initCredentialStores();
    if (username) {
      const user = await client.getUserContext(username, true);
      if (!user) {
        const { config } = app;
        const admins = config.chain.admins;
        await client.setUserContext({ username: admins[0].username, password: admins[0].secret });
        app.logger.debug(util.format('User was not found :', username));
      } else {
        app.logger.debug('User %s was found to be registered and enrolled', username);
      }
    }
    return client;
  }

  async function invokeChainCode(network, peerNames, channelName, chainCodeName, fcn, args, username, org, recovery) {
    let error_message = null;
    let tx_id_string = null;
    let badProposal = false;
    try {
      // first setup the client for this org
      const client = await getClientForOrg(network, username);
      let orderNames = [];
      for (const key in network.orderers) {
        orderNames.push(network.orderers[key].grpcOptions['ssl-target-name-override'])
      }
      const channel = client.getChannel(channelName);
      if (!channel) {
        const message = util.format('Channel %s was not defined in the connection profile', channelName);
        app.logger.error(message);
        return {
          success: false,
          data: message
        }
      }
      const tx_id = client.newTransactionID();
      // will need the transaction ID string for the event registration later
      tx_id_string = tx_id.getTransactionID();

      // send proposal to endorser
      const request = {
        targets: peerNames,
        chaincodeId: chainCodeName,
        fcn,
        args,
        chanId: channelName,
        txId: tx_id,
      };

      const results = await channel.sendTransactionProposal(request);

      // the returned object has both the endorsement results
      // and the actual proposal, the proposal will be needed
      // later when we send a transaction to the orderer
      const proposalResponses = results[0];
      const proposal = results[1];

      // lets have a look at the responses to see if they are
      // all good, if good they will also include signatures
      // required to be committed
      let all_good = true;
      for (const i in proposalResponses) {
        let one_good = false;
        if (proposalResponses && proposalResponses[i].response &&
          proposalResponses[i].response.status === 200) {
          one_good = true;
          app.logger.info('invoke chaincode proposal was good');
        } else {
          error_message = proposalResponses[i].message.toString('utf8');
          app.logger.error('invoke chaincode proposal was bad');
        }
        all_good = all_good & one_good;
      }

      if (all_good) {
        // wait for the channel-based event hub to tell us
        // that the commit was good or bad on each peer in our organization
        const promises = [];
        const event_hubs = channel.getChannelEventHubsForOrg();
        event_hubs.forEach(eh => {
          const invokeEventPromise = new Promise((resolve, reject) => {
            const event_timeout = setTimeout(() => {
              const message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
              app.logger.error(message);
              eh.disconnect();
            }, 30000);
            eh.registerTxEvent(tx_id_string, (tx, code, block_num) => {
              app.logger.info('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
              app.logger.info('Transaction %s has status of %s in block %s', tx, code, block_num);
              clearTimeout(event_timeout);

              if (code !== 'VALID') {
                const message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
                app.logger.error(message);
                reject(new Error(message));
              } else {
                const message = 'The invoke chaincode transaction was valid.';
                app.logger.info(message);
                resolve(message);
              }
            }, err => {
              clearTimeout(event_timeout);
              app.logger.error(err);
              reject(err);
            },
              // the default for 'unregister' is true for transaction listeners
              // so no real need to set here, however for 'disconnect'
              // the default is false as most event hubs are long running
              // in this use case we are using it only once
              { unregister: true, disconnect: true }
            );
            eh.connect();
          });
          promises.push(invokeEventPromise);
        });

        const orderer_request = {
          txId: tx_id,
          proposalResponses,
          proposal,
          orderer: orderNames[0],
        };
        for (let i = proposalResponses.length - 1; i >= 0; i--) {
          if (proposalResponses && proposalResponses[i].response &&
            proposalResponses[i].response.status === 200) {
            app.logger.info('keep good proposal');
          } else {
            badProposal = true;
            app.logger.info('delete bad proposal', proposalResponses[i]);
            proposalResponses.splice(i, 1);
          }
        }
        const sendPromise = channel.sendTransaction(orderer_request);
        // put the send to the orderer last so that the events get registered and
        // are ready for the orderering and committing
        promises.push(sendPromise);
        const results = await Promise.all(promises);
        const response = results.pop(); //  orderer results are last in the results
        if (response.status === 'SUCCESS') {
          app.logger.info('Successfully sent transaction to the orderer.');
        } else {
          error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
          app.logger.debug(error_message);
        }

        // now see what each of the event hubs reported
        for (const i in results) {
          const event_hub_result = results[i];
          if (typeof event_hub_result === 'string') {
            app.logger.debug(event_hub_result);
          } else {
            if (!error_message) error_message = event_hub_result.toString();
            app.logger.debug(event_hub_result.toString());
          }
        }
      } else {
        error_message = util.format('Failed to send Proposal and receive all good ProposalResponse: %s', error_message);
      }
    } catch (error) {
      app.logger.error('Failed to invoke due to error: ' + error.stack ? error.stack : error);
      error_message = error.toString();
    }

    if (badProposal) {
      if (!checkingHealthy) {
        checkingHealthy = true;
        try {
          new Promise(() => {
            checkLedgerForPeers(network, peerNames, channelName, chainCodeName, username, org, recovery);
          }).catch(err => {
            console.log('recover peer error:', err.toString());
          }
          )
        } catch (e) {
          console.log('e', e.toString());
        } finally {
          checkingHealthy = false;
        }
      }
    }
    if (!error_message) {
      const message = util.format(
        'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
        org, channelName, tx_id_string);
      app.logger.info(message);

      return {
        data: tx_id_string,
        success: true,
      };
    }
    const message = util.format('Failed to invoke chaincode. cause: %s', error_message);
    app.logger.error(message);
    return {
      success: false,
      data: message,
    };
  }

  async function queryChainCode(network, peer, channelName, chainCodeName, fcn, args, username) {
    try {
      // first setup the client
      const client = await getClientForOrg(network, username);
      const channel = client.newChannel(channelName);
      setupPeers(network, channel, client);
      if (!channel) {
        const message = util.format('Channel %s was not defined in the connection profile', channelName);
        app.logger.error(message);
        return {
          success: false,
          data: message,
        };
      }

      // send query
      const request = {
        targets: peer, // queryByChaincode allows for multiple targets
        chaincodeId: chainCodeName,
        fcn,
        args,
      };
      const response_payloads = await channel.queryByChaincode(request);
      if (response_payloads) {
        for (let i = 0; i < response_payloads.length; i++) {
          const responseStr = response_payloads[i].toString('utf8');
          if (!(responseStr.includes('Error:'))) {
            return {
              success: true,
              data: response_payloads[i].toString('utf8'),
            };
          }
        }
        return {
          success: false,
          data: response_payloads[0].toString('utf8'),
        };
      } else {
        app.logger.error('response_payloads is null');
        return {
          success: false,
          data: 'response_payloads is null',
        };
      }
    } catch (error) {
      app.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
      return {
        success: false,
        data: error.toString(),
      };
    }
  }

  async function queryBlock(network, channelName, username, blockNumber) {
    try {
      // first setup the client
      const client = await getClientForOrg(network, username);
      const channel = client.newChannel(channelName);
      setupPeers(network, channel, client);
      if (!channel) {
        const message = util.format('Channel %s was not defined in the connection profile', channelName);
        app.logger.error(message);
        return {
          success: false,
          data: message,
        };
      }

      return {
        success: true,
        data: await channel.queryBlock(blockNumber),
      }
    } catch (error) {
      app.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
      return {
        success: false,
        data: error.toString(),
      };
    }
  }

  async function queryInfo(network, channelName, username) {
    try {
      // first setup the client
      const client = await getClientForOrg(network, username);
      const channel = client.newChannel(channelName);
      setupPeers(network, channel, client);
      if (!channel) {
        const message = util.format('Channel %s was not defined in the connection profile', channelName);
        app.logger.error(message);
        return {
          success: false,
          data: message,
        };
      }

      return {
        success: true,
        data: await channel.queryInfo(),
      }
    } catch (error) {
      app.logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
      return {
        success: false,
        data: error.toString(),
      };
    }
  }

  app.invokeChainCode = invokeChainCode;
  app.queryChainCode = queryChainCode;
  app.queryBlock = queryBlock;
  app.queryInfo = queryInfo;
}