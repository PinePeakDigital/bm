import { Goal } from "../services/beeminder";
import groupGoals from "./groupGoals";

export type GoalGroup = "pinned" | "today" | "next" | "later";

// The dashboard's display layout: which goal groups appear, in what order, and
// how they cluster into the grid's visual rows. This is the single definition
// of goal display order — the grid renders these rows and the pager walks the
// flattened order, both derived from here, so the grid and "prev/next" can't
// drift apart. Add or reorder a group in one place and both update together.
const ROWS: GoalGroup[][] = [["pinned"], ["today", "next"], ["later"]];

export type GoalRow = {
  // The groups making up this visual row, in order.
  groups: GoalGroup[];
  // Their goals, concatenated in group order.
  goals: Goal[];
};

export type GoalRoster = {
  // The grid's visual rows, in display order.
  rows: GoalRow[];
  // Every goal flattened in display order — the order the pager walks.
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

// The single definition of how the dashboard lays out and orders goals, and how
// you move between them. Both the goal grid and the detail pager go through
// this, so the rendered order and "prev/next"/"X of N" share one ordered list.
export default function goalRoster(
  goals: Goal[],
  currentSlug?: string
): GoalRoster {
  const grouped = groupGoals(goals);
  const rows: GoalRow[] = ROWS.map((groups) => ({
    groups,
    goals: groups.flatMap((name) => grouped[name]),
  }));
  const ordered = rows.flatMap((row) => row.goals);
  const index = ordered.findIndex((g) => g.slug === currentSlug);

  return {
    rows,
    ordered,
    index,
    count: ordered.length,
    current: ordered[index],
    prev: ordered[index - 1],
    next: ordered[index + 1],
  };
}
