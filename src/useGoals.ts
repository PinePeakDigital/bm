import { useQuery } from "@tanstack/react-query";
import { isAuthenticated, logout } from "./auth";
import { getGoals, Goal, BeeminderApiError } from "./services/beeminder";
import { isProcessing } from "./lib/goalProcessing";

// The single source of truth for the goals query key. Anything that reads or
// mutates the cached goals list keys off this.
export const GOALS_QUERY_KEY = ["goals"] as const;

// What to do when the goals query fails. A stale/invalid token surfaces as a
// 401 — drop it and send the user back to login. Everything else (incl. network
// failures, which aren't a BeeminderApiError) is surfaced to the console.
// Extracted from the hook so the branch is unit-testable without a provider.
export function handleGoalsError(err: Error) {
  if (err instanceof BeeminderApiError && err.status === 401) {
    return logout();
  }
  console.error(err);
}

export default function useGoals() {
  return useQuery<Goal[], Error>(GOALS_QUERY_KEY, () => getGoals(), {
    enabled: isAuthenticated(),
    refetchInterval: (d) => (d?.some(isProcessing) ? 3000 : 60000),
    refetchIntervalInBackground: false,
    retry: false,
    onError: handleGoalsError,
  });
}
