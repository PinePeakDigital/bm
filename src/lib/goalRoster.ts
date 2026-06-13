import { Goal } from "../services/beeminder";
import filterGoals from "./filterGoals";
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

export type GoalRosterOptions = {
  // Narrow the roster to goals matching the dashboard search box. Omitted or
  // empty means no filtering — the detail pager walks the full, unfiltered list.
  filter?: string;
  // Slug of the goal currently open in the detail pager, if any.
  currentSlug?: string;
};

// The single definition of how the dashboard turns the raw goal list into what
// you see and how you move through it: filter (search box) → classify → group →
// order → locate the current goal's neighbours. Both the goal grid and the
// detail pager go through this, so the rendered order, the filtered set, and
// "prev/next"/"X of N" all share one pipeline and can't drift apart.
export default function goalRoster(
  goals: Goal[],
  { filter, currentSlug }: GoalRosterOptions = {}
): GoalRoster {
  // filterGoals returns the input untouched for an empty filter, so the pager
  // (which passes no filter) walks every goal.
  const matched = filterGoals(goals, filter ?? "");
  const grouped = groupGoals(matched);
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
