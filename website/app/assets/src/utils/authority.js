// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  return localStorage.getItem("electricity-authority");
}

export function setAuthority(authority) {
  return localStorage.setItem("electricity-authority", authority);
}
