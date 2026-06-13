import { useMemo } from "preact/hooks";
import { Goal } from "../services/beeminder";
import goalRoster from "../lib/goalRoster";
import cnx from "../cnx";
import G from "./goal";
import "./goals.css";

// The goal grid. Each card is a real link to that goal's page; opening,
// paging, and closing a goal are all plain navigation now (see goalPage.tsx),
// so there's no modal or selection state to track here. The rows, their order,
// and the search filtering all come from goalRoster — the single source of goal
// display order, shared with the detail pager so the grid and "prev/next" can't
// drift.
export function Goals({ goals, filter }: { goals: Goal[]; filter?: string }) {
  const { rows } = useMemo(
    () => goalRoster(goals, { filter }),
    [goals, filter]
  );

  return (
    <div class="goals">
      {rows.map((row) => (
        <div
          key={row.groups.join(",")}
          class={cnx(
            "goals__grid",
            row.groups.includes("pinned") && "goals__pinned"
          )}
        >
          {row.goals.map((g) => (
            <G key={g.slug} g={g} />
          ))}
        </div>
      ))}
    </div>
  );
}
