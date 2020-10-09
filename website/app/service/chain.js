'use strict';

const Service = require('egg').Service;
const jsonfile = require('jsonfile')

class ChainService extends Service {
  async _generateNetwork() {
    const { config } = this;
    const chainRootDir = `${config.dataDir}/chains`;
    const kvsPath = `${chainRootDir}/client-kvs`;
    const cvsPath = `${chainRootDir}/client-cvs`;
    const cryptoConfigPath = `D:/data/code/go/src/github.com/zghh/electricity/crypto-config`;
    const ordererURL = '81.70.23.98:8050';
    const caURL = ['81.70.23.98:7850', '81.70.23.98:7950'];
    const peerURL = [['81.70.23.98:7050', '81.70.23.98:7250'], ['81.70.23.98:7450', '81.70.23.98:7650']];
    let network = {};
    const peers = {};
    const orderers = {};
    const certificateAuthorities = {};
    const channelsPeers = {};
    const organizations = {};
    const channels = {
      orderers: [
        'orderer.example.com',
      ],
    };
    orderers['orderer.example.com'] = {
      grpcOptions: {
        'ssl-target-name-override': 'orderer.example.com',
      },
      tlsCACerts: {
        path: `${cryptoConfigPath}/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt`,
      },
      url: `grpcs://${ordererURL}`,
    };
    for (let index = 0; index < 2; index++) {
      const peerNames = [];
      for (let peerIndex = 0; peerIndex < 2; peerIndex++) {
        peerNames.push(`peer${peerIndex}.org${index + 1}.example.com`);
        peers[`peer${peerIndex}.org${index + 1}.example.com`] = {
          url: `grpcs://${peerURL[index][peerIndex]}`,
          grpcOptions: {
            'ssl-target-name-override': `peer${peerIndex}.org${index + 1}.example.com`,
          },
          tlsCACerts: {
            path: `${cryptoConfigPath}/peerOrganizations/org${index + 1}.example.com/peers/peer${peerIndex}.org${index + 1}.example.com/tls/ca.crt`,
          },
        };
        channelsPeers[`peer${peerIndex}.org${index + 1}.example.com`] = {
          chaincodeQuery: true,
          endorsingPeer: peerIndex === 0,
          eventSource: peerIndex === 0,
          ledgerQuery: true,
        };
      }
      organizations[`org${index + 1}`] = {
        adminPrivateKey: {
          path: `${cryptoConfigPath}/peerOrganizations/org${index + 1}.example.com/users/Admin@org${index + 1}.example.com/msp/keystore/admin_sk`,
        },
        certificateAuthorities: [`ca-org${index + 1}`],
        mspid: `Org${index + 1}MSP`,
        peers: peerNames,
        signedCert: {
          path: `${cryptoConfigPath}/peerOrganizations/org${index + 1}.example.com/users/Admin@org${index + 1}.example.com/msp/signcerts/Admin@org${index + 1}.example.com-cert.pem`,
        },
      };
      certificateAuthorities[`ca-org${index + 1}`] = {
        caName: `ca-org${index + 1}`,
        httpOptions: {
          verify: false,
        },
        registrar: [{
          enrollId: 'admin',
          enrollSecret: 'adminpw',
        },],
        tlsCACerts: {
          path: `${cryptoConfigPath}/peerOrganizations/org${index + 1}.example.com/ca/ca.org${index + 1}.example.com-cert.pem`,
        },
        url: `https://${caURL[index]}`,
      };
    }
    channels.peers = channelsPeers;
    network = Object.assign(network, {
      name: 'network',
      description: 'network',
      version: '1.0',
      client: {
        organization: 'org1',
        credentialStore: {
          path: kvsPath,
          cryptoStore: {
            path: cvsPath
          },
          wallet: 'wallet',
        },
      },
      channels: {
        mychannel: channels,
      },
      orderers,
      certificateAuthorities,
      organizations,
      peers,
    });
    return network;
  }
  async generateNetwork() {
    const network = jsonfile.readFileSync('./config/connect.json');
    return network;
  }

  async getBlocks(start, end) {
    const decode = (bytes) => {
      var encoded = "";
      for (var i = 0; i < bytes.length; i++) {
        encoded += '%' + bytes[i].toString(16);
      }
      return decodeURIComponent(encoded);
    }
    const { ctx, config } = this;
    const { channelName, chaincodeName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    let blocks = {
      success: true,
      data: [],
    };
    for (let i = start; i < end; i++) {
      const result = await ctx.queryBlock(network, channelName, username, i);
      if (result.success) {
        const blockData = JSON.parse(JSON.stringify(result.data));
        let block = {
          header: {
            number: blockData.header.number,
            previousHash: blockData.header.previous_hash,
            dataHash: blockData.header.data_hash,
          },
          data: [],
        }
        blockData.data.data.forEach(transactionData => {
          if (transactionData.payload.header.channel_header.type != 3) { return; }
          const funcName = String.fromCharCode.apply(String, transactionData.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[0].data);
          if (funcName !== 'submitSellerOrder' && funcName !== 'submitBuyerOrder') { return; }
          let transaction = {
            header: {
              txId: transactionData.payload.header.channel_header.tx_id,
              timestamp: parseInt(Date.parse(transactionData.payload.header.channel_header.timestamp) / 1000),
              hash: transactionData.payload.data.actions[0].payload.action.proposal_response_payload.proposal_hash,
            },
            data: {
              order: JSON.parse(decode(transactionData.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[1].data)),
              transactions: [],
              orders: [],
            },
          }
          transactionData.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.forEach(nsrwset => {
            if (nsrwset.namespace !== chaincodeName) { return; }
            nsrwset.rwset.writes.forEach(set => {
              if (set.key.startsWith('transaction-')) {
                transaction.data.transactions.push(JSON.parse(set.value));
              }
              if (set.key.startsWith('order-')) {
                transaction.data.orders.push(JSON.parse(set.value));
              }
            });
          });
          block.data.push(transaction);
        });
        blocks.data.push(block);
      } else {
        return result;
      }
    }
    return blocks;
  }

  async getInfo() {
    const { ctx, config } = this;
    const { channelName } = config.chain;
    const username = config.chain.admins[0].username;
    const network = await ctx.service.chain.generateNetwork();
    const result = await ctx.queryInfo(network, channelName, username);
    if (result.success) {
      return {
        success: true,
        data: {
          height: {
            low: result.data.height.low,
            high: result.data.height.high,
          }
        }
      }
    } else {
      return result;
    }
  }
}

module.exports = ChainService;


