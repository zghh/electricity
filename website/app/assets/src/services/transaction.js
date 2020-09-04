import request from "../utils/request";

const format = require("string-format");
format.extend(String.prototype);

export async function queryTransactions(id) {
  return request(`${'/api/queryTransactions/{id}'.format({ id })}`);
}
