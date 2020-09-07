/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    logger: {
      level: process.env.LOG_LEVEL || 'INFO',
    },
    static: {
      prefix: '/static/',
      dir: [path.join(appInfo.baseDir, 'app/assets/public')],
    },
    view: {
      defaultViewEngine: 'nunjucks',
      defaultExtension: '.tpl',
      mapping: {
        '.tpl': 'nunjucks',
      },
    },
    dataDir: '/var/data',
    chain: {
      channelName: 'mychannel',
      invokePeers: ['peer0.org1.example.com'],
      queryPeer: 'peer0.org1.example.com',
      orgName: 'org1',
      chaincodeName: process.env.CHAINCODE_NAME || '090e9533000c4f4c871148b49f9ca42d-5f54bc167e7a5a005c2d1da9',
      admins: [
        {
          username: 'admin',
          secret: 'adminpw',
        },
      ],
    }
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1598967478171_4239';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
