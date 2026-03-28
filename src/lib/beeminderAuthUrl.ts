export function beeminderAuthUrl(
  username: string,
  apiKey: string,
  targetUrl: string
): string {
  return `https://www.beeminder.com/api/v1/users/${encodeURIComponent(username)}.json?auth_token=${apiKey}&redirect_to_url=${encodeURIComponent(targetUrl)}`;
}
