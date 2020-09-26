'use strict';

module.exports = {
  get invokeChainCode() {
    return this.app.invokeChainCode;
  },
  get queryChainCode() {
    return this.app.queryChainCode;
  },
  get queryBlock() {
    return this.app.queryBlock;
  },
  get queryInfo() {
    return this.app.queryInfo;
  },
};
