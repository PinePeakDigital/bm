import { describe, it, expect, vi, beforeEach } from "vitest";

// react-query hooks can't run under this repo's vitest setup (the preact/compat
// alias isn't wired up), so we don't mount a provider or call the hook. Instead
// we exercise goalMutationOptions' cache callbacks directly against a mocked
// queryClient — mirroring the pure-function spec style used elsewhere.
// `vi.hoisted` defines the mock above the hoisted `vi.mock` factory.
const { queryClient } = vi.hoisted(() => ({
  queryClient: {
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  },
}));

vi.mock("./queryClient", () => ({ default: queryClient }));

import { goalMutationOptions } from "./useGoalMutations";
import { GOALS_QUERY_KEY } from "./useGoals";
import { Goal } from "./services/beeminder";

type Updater = (goals?: Goal[]) => Goal[] | undefined;

function goal(slug: string, queued = false): Goal {
  return { slug, queued } as Goal;
}

// The functional updater handed to the most recent setQueryData call.
function lastUpdater(): Updater {
  const calls = queryClient.setQueryData.mock.calls as Array<[unknown, Updater]>;
  return calls[calls.length - 1][1];
}

describe("goalMutationOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("onMutate", () => {
    it("optimistically marks only the matching goal as queued, immutably", async () => {
      const before = [goal("a"), goal("b")];
      queryClient.getQueryData.mockReturnValue(before);

      const context = await goalMutationOptions("a").onMutate?.(undefined);

      // Snapshots the previous state for rollback.
      expect(context).toEqual({ previous: before });

      // Cancels in-flight goal fetches so they can't clobber our optimistic write.
      expect(queryClient.cancelQueries).toHaveBeenCalledWith(GOALS_QUERY_KEY);

      // Apply the functional updater that was handed to setQueryData.
      const after = lastUpdater()(before);

      expect(after).toEqual([goal("a", true), goal("b")]);
      // Original array and the untouched goal are not mutated.
      expect(before[0].queued).toBe(false);
      expect(after).not.toBe(before);
      expect(after?.[1]).toBe(before[1]);
    });

    it("no-ops the updater when the cache is empty", async () => {
      queryClient.getQueryData.mockReturnValue(undefined);

      const context = await goalMutationOptions("a").onMutate?.(undefined);

      expect(context).toEqual({ previous: undefined });
      expect(lastUpdater()(undefined)).toBeUndefined();
    });
  });

  describe("onError", () => {
    it("rolls back to the previous snapshot", () => {
      const previous = [goal("a")];

      goalMutationOptions("a").onError?.(new Error("boom"), undefined, {
        previous,
      });

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        GOALS_QUERY_KEY,
        previous
      );
    });

    it("does nothing when there is no previous snapshot", () => {
      goalMutationOptions("a").onError?.(new Error("boom"), undefined, {
        previous: undefined,
      });

      expect(queryClient.setQueryData).not.toHaveBeenCalled();
    });
  });

  describe("onSettled", () => {
    it("invalidates the scoped goals query", () => {
      goalMutationOptions("a").onSettled?.(undefined, null, undefined, undefined);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
        GOALS_QUERY_KEY
      );
    });
  });
});
