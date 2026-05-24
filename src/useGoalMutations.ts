import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import queryClient from "./queryClient";
import { GOALS_QUERY_KEY } from "./useGoals";
import {
  createDatapoint,
  deleteDatapoint,
  refreshGraph,
  Goal,
} from "./services/beeminder";

type Context = { previous?: Goal[] };

// Every goal mutation behaves the same way around the goals cache:
//   1. optimistically mark the goal as `queued` so the UI shows it working,
//   2. roll that back if the mutation fails, and
//   3. invalidate the goals query once it settles so we refetch the truth.
//
// This is the one place that knows the cache shape and the query key. Callers
// just express intent. Exported for unit testing of the cache callbacks.
export function goalMutationOptions<TVariables>(
  slug: string
): UseMutationOptions<unknown, unknown, TVariables, Context> {
  return {
    onMutate: async () => {
      await queryClient.cancelQueries(GOALS_QUERY_KEY);
      const previous = queryClient.getQueryData<Goal[]>(GOALS_QUERY_KEY);
      queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (goals) =>
        goals?.map((g) => (g.slug === slug ? { ...g, queued: true } : g))
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(GOALS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries(GOALS_QUERY_KEY),
  };
}

// All the ways a goal can change, behind one interface. `refresh` takes the
// goal's autodata (a string URL fetches that endpoint; otherwise we ask
// Beeminder to refresh the graph) so the caller doesn't decide how to refresh.
export default function useGoalMutations(slug: string) {
  const addDatapoint = useMutation(
    (value: number) => createDatapoint(slug, value),
    goalMutationOptions<number>(slug)
  );

  const copyDatapoint = useMutation(
    (value: number) => createDatapoint(slug, value),
    goalMutationOptions<number>(slug)
  );

  const removeDatapoint = useMutation(
    (id: string) => deleteDatapoint(slug, id),
    goalMutationOptions<string>(slug)
  );

  const refresh = useMutation(
    (autodata: string | boolean) =>
      typeof autodata === "string" ? fetch(autodata) : refreshGraph(slug),
    goalMutationOptions<string | boolean>(slug)
  );

  return { addDatapoint, copyDatapoint, removeDatapoint, refresh };
}
