import request from "../utils/request";
import md5 from 'js-md5';

export async function queryCurrent() {
  return request("/api/currentUser");
}

export async function login(params) {
  const { password, username } = params;
  return request("login", {
    method: "POST",
    body: {
      username,
      password: md5(password),
    },
  });
}

export async function register(payload) {
  const { password, name, type, username } = payload;
  let typeNumber = 0;
  if (type === 'normal') {
    typeNumber = 1;
  } else if (type === 'productive') {
    typeNumber = 2;
  } else if (type === 'traditional') {
    typeNumber = 3;
  }
  return request("/api/register", {
    method: "POST",
    body: {
      id: username,
      name,
      type: typeNumber,
      password: md5(password),
    },
  });
}

export async function queryUsers() {
  return request('/api/queryUsers');
}
