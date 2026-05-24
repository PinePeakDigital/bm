import { useQuery } from "@tanstack/react-query";
import { API_KEY, logout } from "./auth";
import { getGoals, Goal, BeeminderApiError } from "./services/beeminder";

// The single source of truth for the goals query key. Anything that reads or
// mutates the cached goals list keys off this.
export const GOALS_QUERY_KEY = ["goals"] as const;

export default function useGoals() {
  return useQuery<Goal[], Error>(GOALS_QUERY_KEY, () => getGoals(), {
    enabled: !!API_KEY,
    refetchInterval: (d) => (d?.find((g) => g.queued) ? 3000 : 60000),
    refetchIntervalInBackground: false,
    retry: false,
    onError: (err) => {
      // A stale/invalid token surfaces as a 401; drop it and send the user back
      // to login. Other errors (incl. network failures, which aren't a
      // BeeminderApiError) are surfaced to the console.
      if (err instanceof BeeminderApiError && err.status === 401) {
        return logout();
      }
      console.error(err);
    },
  });
}
