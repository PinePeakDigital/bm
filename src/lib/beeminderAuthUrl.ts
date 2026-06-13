import { getCredentials } from "../auth";

// Build an authenticated deep-link into Beeminder: the API endpoint logs the
// user in with their stored token and redirects to `targetUrl`. Credentials are
// sourced from the session module here, so callers (and the views) just say
// where they want to go and never touch the credential shape themselves.
export function beeminderAuthUrl(targetUrl: string): string {
  const { username, apiKey } = getCredentials();
  return `https://www.beeminder.com/api/v1/users/${encodeURIComponent(username)}.json?auth_token=${encodeURIComponent(apiKey)}&redirect_to_url=${encodeURIComponent(targetUrl)}`;
}
