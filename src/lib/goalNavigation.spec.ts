import { describe, it, expect } from "vitest";
import { Goal } from "../services/beeminder";
import goalNavigation from "./goalNavigation";

function goal(props: Partial<Goal>): Goal {
  return props as Goal;
}

// A goal that lands in the "today" group (safebuf 0); `losedate` controls the
// sort order within the group.
function today(slug: string, losedate: number): Goal {
  return goal({ slug, safebuf: 0, losedate });
}

describe("goalNavigation", () => {
  it("returns an empty navigation for no goals", () => {
    const nav = goalNavigation([], undefined);
    expect(nav.ordered).toEqual([]);
    expect(nav.count).toBe(0);
    expect(nav.index).toBe(-1);
    expect(nav.current).toBeUndefined();
    expect(nav.prev).toBeUndefined();
    expect(nav.next).toBeUndefined();
  });

  it("orders goals by group (pinned, today, next, later), flattened", () => {
    const goals = [
      goal({ slug: "later1", safebuf: 10, todayta: true, losedate: 5 }),
      goal({ slug: "pinned1", fineprint: "#bmPin", safebuf: 3, losedate: 4 }),
      goal({ slug: "today1", safebuf: 0, losedate: 3 }),
    ];

    expect(goalNavigation(goals).ordered.map((x) => x.slug)).toEqual([
      "pinned1",
      "today1",
      "later1",
    ]);
  });

  it("reports index, count and neighbours for a middle goal", () => {
    const goals = [today("a", 1), today("b", 2), today("c", 3)];
    const nav = goalNavigation(goals, "b");

    expect(nav.index).toBe(1);
    expect(nav.count).toBe(3);
    expect(nav.current?.slug).toBe("b");
    expect(nav.prev?.slug).toBe("a");
    expect(nav.next?.slug).toBe("c");
  });

  it("has no prev at the start and no next at the end", () => {
    const goals = [today("a", 1), today("b", 2), today("c", 3)];

    const first = goalNavigation(goals, "a");
    expect(first.prev).toBeUndefined();
    expect(first.next?.slug).toBe("b");

    const last = goalNavigation(goals, "c");
    expect(last.next).toBeUndefined();
    expect(last.prev?.slug).toBe("b");
  });

  it("treats an absent current slug as before the list: index -1, next is the first goal", () => {
    // Preserves the prior grid behaviour where, with nothing open, advancing
    // ("next") jumps to the first goal.
    const goals = [today("a", 1), today("b", 2)];
    const nav = goalNavigation(goals, undefined);

    expect(nav.index).toBe(-1);
    expect(nav.current).toBeUndefined();
    expect(nav.prev).toBeUndefined();
    expect(nav.next?.slug).toBe("a");
  });
});
