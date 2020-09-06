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
}

module.exports = ChainService;


