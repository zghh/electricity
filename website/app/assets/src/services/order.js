import request from "../utils/request";

const format = require("string-format");
format.extend(String.prototype);

export async function queryCurrentOrders() {
  return request('/api/queryCurrentOrders');
}

export async function queryMyOrders(id) {
  return request(`${'/api/queryMyOrders/{id}'.format({ id })}`);
}

export async function newOrder(payload) {
  return request('/api/newOrder', {
    method: "POST",
    body: payload,
  });
}

export async function queryOrderInfo(id) {
  return request(`${'/api/queryOrderInfo/{id}'.format({ id })}`);
}