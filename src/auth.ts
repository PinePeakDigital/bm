// The session module: the one place that knows where Beeminder credentials
// live (localStorage) and the seam tests can stand in for. Credentials are read
// on demand rather than captured at import, so callers never see a stale value
// (the previous module-level consts only refreshed on a full page reload).

const USERNAME_KEY = "username";
const TOKEN_KEY = "api_key";

export type Credentials = {
  username: string;
  apiKey: string;
};

export function getCredentials(): Credentials {
  return {
    username: localStorage.getItem(USERNAME_KEY) || "",
    apiKey: localStorage.getItem(TOKEN_KEY) || "",
  };
}

export function isAuthenticated(): boolean {
  return getCredentials().apiKey !== "";
}

export function login(username: string, apiKey: string) {
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(TOKEN_KEY, apiKey);
  window.location.href = "/";
}

export function logout() {
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/";
}
