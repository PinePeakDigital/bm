import { Goal } from "../services/beeminder";
import groupGoals from "./groupGoals";

export type GoalNavigation = {
  // All goals in dashboard display order (pinned, today, next, later), flattened.
  ordered: Goal[];
  // Zero-based position of the current goal in `ordered`; -1 when there is no
  // current goal or it isn't in the list.
  index: number;
  // Total number of goals in `ordered`.
  count: number;
  // The current goal and its neighbours in display order (undefined at the ends).
  current?: Goal;
  prev?: Goal;
  next?: Goal;
};

// The single definition of how the dashboard orders goals and how you move
// between them. Both the goal grid and the detail pager navigate through this,
// so "prev/next" and "X of N" can't drift apart (they share one ordered list).
export default function goalNavigation(
  goals: Goal[],
  currentSlug?: string
): GoalNavigation {
  // Flatten the groups explicitly so the display/traversal order is locked here
  // rather than relying on object key iteration order.
  const grouped = groupGoals(goals);
  const ordered = [
    ...grouped.pinned,
    ...grouped.today,
    ...grouped.next,
    ...grouped.later,
  ];
  const index = ordered.findIndex((g) => g.slug === currentSlug);

  return {
    ordered,
    index,
    count: ordered.length,
    current: ordered[index],
    prev: ordered[index - 1],
    next: ordered[index + 1],
  };
}
