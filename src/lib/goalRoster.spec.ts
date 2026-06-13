import { describe, it, expect } from "vitest";
import { Goal } from "../services/beeminder";
import goalRoster from "./goalRoster";

function goal(props: Partial<Goal>): Goal {
  return props as Goal;
}

// A goal that lands in the "today" group (safebuf 0); `losedate` controls the
// sort order within the group.
function today(slug: string, losedate: number): Goal {
  return goal({ slug, safebuf: 0, losedate });
}

describe("goalRoster", () => {
  it("returns an empty roster for no goals", () => {
    const roster = goalRoster([]);
    expect(roster.ordered).toEqual([]);
    expect(roster.count).toBe(0);
    expect(roster.index).toBe(-1);
    expect(roster.current).toBeUndefined();
    expect(roster.prev).toBeUndefined();
    expect(roster.next).toBeUndefined();
    // The grid still gets its fixed set of (empty) rows.
    expect(roster.rows.map((r) => r.groups)).toEqual([
      ["pinned"],
      ["today", "next"],
      ["later"],
    ]);
  });

  it("orders goals by group (pinned, today, next, later), flattened", () => {
    const goals = [
      goal({ slug: "later1", safebuf: 10, todayta: true, losedate: 5 }),
      goal({ slug: "pinned1", fineprint: "#bmPin", safebuf: 3, losedate: 4 }),
      goal({ slug: "today1", safebuf: 0, losedate: 3 }),
    ];

    expect(goalRoster(goals).ordered.map((x) => x.slug)).toEqual([
      "pinned1",
      "today1",
      "later1",
    ]);
  });

  it("clusters today and next into one grid row; pinned and later on their own", () => {
    const goals = [
      goal({ slug: "pinned1", fineprint: "#bmPin", safebuf: 3, losedate: 4 }),
      goal({ slug: "today1", safebuf: 0, losedate: 3 }),
      goal({ slug: "next1", safebuf: 2, losedate: 6 }),
      goal({ slug: "later1", safebuf: 10, todayta: true, losedate: 5 }),
    ];

    const roster = goalRoster(goals);
    expect(roster.rows.map((r) => r.goals.map((g) => g.slug))).toEqual([
      ["pinned1"],
      ["today1", "next1"],
      ["later1"],
    ]);
  });

  it("flattening the grid rows yields exactly the pager order", () => {
    // The whole point of the module: the grid and the pager can't drift because
    // `ordered` is derived from the same rows the grid renders.
    const goals = [
      goal({ slug: "later1", safebuf: 10, todayta: true, losedate: 5 }),
      goal({ slug: "pinned1", fineprint: "#bmPin", safebuf: 3, losedate: 4 }),
      goal({ slug: "today1", safebuf: 0, losedate: 3 }),
      goal({ slug: "next1", safebuf: 2, losedate: 6 }),
    ];

    const roster = goalRoster(goals);
    const fromRows = roster.rows.flatMap((r) => r.goals.map((g) => g.slug));
    expect(fromRows).toEqual(roster.ordered.map((g) => g.slug));
  });

  it("reports index, count and neighbours for a middle goal", () => {
    const goals = [today("a", 1), today("b", 2), today("c", 3)];
    const roster = goalRoster(goals, { currentSlug: "b" });

    expect(roster.index).toBe(1);
    expect(roster.count).toBe(3);
    expect(roster.current?.slug).toBe("b");
    expect(roster.prev?.slug).toBe("a");
    expect(roster.next?.slug).toBe("c");
  });

  it("has no prev at the start and no next at the end", () => {
    const goals = [today("a", 1), today("b", 2), today("c", 3)];

    const first = goalRoster(goals, { currentSlug: "a" });
    expect(first.prev).toBeUndefined();
    expect(first.next?.slug).toBe("b");

    const last = goalRoster(goals, { currentSlug: "c" });
    expect(last.next).toBeUndefined();
    expect(last.prev?.slug).toBe("b");
  });

  it("treats an absent current slug as before the list: index -1, next is the first goal", () => {
    // Preserves the prior grid behaviour where, with nothing open, advancing
    // ("next") jumps to the first goal.
    const goals = [today("a", 1), today("b", 2)];
    const roster = goalRoster(goals);

    expect(roster.index).toBe(-1);
    expect(roster.current).toBeUndefined();
    expect(roster.prev).toBeUndefined();
    expect(roster.next?.slug).toBe("a");
  });

  it("treats an unknown current slug the same as absent: index -1, next is the first goal", () => {
    // The goal-detail not-found page routes to a slug string that isn't in the
    // list; it must behave like the empty-slug case rather than throwing.
    const goals = [today("a", 1), today("b", 2)];
    const roster = goalRoster(goals, { currentSlug: "missing-slug" });

    expect(roster.index).toBe(-1);
    expect(roster.current).toBeUndefined();
    expect(roster.prev).toBeUndefined();
    expect(roster.next?.slug).toBe("a");
  });

  describe("filtering pipeline", () => {
    it("returns every goal when no filter is given (the pager's view)", () => {
      const goals = [today("alpha", 1), today("beta", 2), today("gamma", 3)];
      expect(goalRoster(goals).ordered.map((g) => g.slug)).toEqual([
        "alpha",
        "beta",
        "gamma",
      ]);
    });

    it("narrows the roster to goals matching the filter before grouping", () => {
      const goals = [today("run-am", 1), today("run-pm", 2), today("sleep", 3)];
      const roster = goalRoster(goals, { filter: "run" });

      // "run" matches both run-* goals (regex, case-insensitive); count
      // reflects the filtered set, not the full list.
      expect(roster.ordered.map((g) => g.slug)).toEqual(["run-am", "run-pm"]);
      expect(roster.count).toBe(2);
    });

    it("groups and orders the filtered set, not the raw input", () => {
      // Filtering happens first, so a filtered-out "today" goal can't sneak into
      // the today row or shift the flattened order.
      const goals = [
        goal({ slug: "keep-pinned", fineprint: "#bmPin", safebuf: 3, losedate: 4 }),
        goal({ slug: "drop-today", safebuf: 0, losedate: 1 }),
        goal({ slug: "keep-later", safebuf: 10, todayta: true, losedate: 5 }),
      ];
      const roster = goalRoster(goals, { filter: "keep" });

      expect(roster.ordered.map((g) => g.slug)).toEqual([
        "keep-pinned",
        "keep-later",
      ]);
      expect(roster.rows.map((r) => r.goals.map((g) => g.slug))).toEqual([
        ["keep-pinned"],
        [],
        ["keep-later"],
      ]);
    });

    it("locates the current goal within the filtered set", () => {
      const goals = [today("run-am", 1), today("run-pm", 2), today("sleep", 3)];
      // sleep is filtered out, so paging is relative to [run-am, run-pm].
      const roster = goalRoster(goals, { filter: "run", currentSlug: "run-am" });

      expect(roster.index).toBe(0);
      expect(roster.count).toBe(2);
      expect(roster.next?.slug).toBe("run-pm");
    });

    it("falls back to a literal match for an invalid regex filter", () => {
      // A lone "(" would throw from new RegExp; filterGoals degrades to a
      // case-insensitive substring match rather than crashing the roster.
      const goals = [goal({ slug: "a(b", safebuf: 0, losedate: 1 })];
      expect(() => goalRoster(goals, { filter: "a(" })).not.toThrow();
      expect(goalRoster(goals, { filter: "a(" }).ordered.map((g) => g.slug)).toEqual([
        "a(b",
      ]);
    });
  });
});
