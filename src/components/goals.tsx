import { useMemo } from "preact/hooks";
import { Goal } from "../services/beeminder";
import groupGoals from "../lib/groupGoals";
import G from "./goal";
import "./goals.css";

// The goal grid. Each card is a real link to that goal's page; opening,
// paging, and closing a goal are all plain navigation now (see goalPage.tsx),
// so there's no modal or selection state to track here.
export function Goals({ goals }: { goals: Goal[] }) {
  const g = useMemo(() => groupGoals(goals), [goals]);

  return (
    <div class="goals">
      <div class="goals__grid goals__pinned">
        {g.pinned.map((g) => (
          <G key={g.slug} g={g} />
        ))}
      </div>
      <div class="goals__grid">
        {[...g.today, ...g.next].map((g) => (
          <G key={g.slug} g={g} />
        ))}
      </div>
      <div class="goals__grid">
        {g.later.map((g) => (
          <G key={g.slug} g={g} />
        ))}
      </div>
    </div>
  );
}
