'use strict';

module.exports = {
  get invokeChainCode() {
    return this.app.invokeChainCode;
  },
  get queryChainCode() {
    return this.app.queryChainCode;
  },
};
