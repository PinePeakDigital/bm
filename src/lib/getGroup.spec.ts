import { describe, it, expect } from "vitest";
import { Goal } from "../services/beeminder";
import { getGroup } from "./getGroup";

function goal(props: Partial<Goal>): Goal {
  return props as Goal;
}

// Goals are bucketed by safety buffer (`safebuf`, days of leeway), whether
// they've been touched today (`todayta`), and whether they're pinned. These
// tests pin down the thresholds directly rather than through groupGoals.
describe("getGroup", () => {
  describe("pinned", () => {
    it("pins a goal tagged #bmPin regardless of buffer", () => {
      expect(getGroup(goal({ fineprint: "#bmPin", safebuf: 0 }))).toBe("pinned");
      expect(getGroup(goal({ fineprint: "#bmPin", safebuf: 30 }))).toBe(
        "pinned"
      );
    });

    it("pins a Beeminder drinker goal", () => {
      expect(getGroup(goal({ goal_type: "drinker", safebuf: 5 }))).toBe(
        "pinned"
      );
    });

    it("pinning wins over an otherwise-due goal", () => {
      // safebuf 0 would be "today", but the pin takes precedence.
      expect(getGroup(goal({ fineprint: "#bmPin", safebuf: 0 }))).toBe("pinned");
    });
  });

  describe("today", () => {
    it("buckets a due goal (safebuf 0) as today", () => {
      expect(getGroup(goal({ safebuf: 0 }))).toBe("today");
    });
  });

  describe("next vs later threshold (LATER_BUFFER_THRESHOLD = 7)", () => {
    it("an untouched goal just under the threshold is next", () => {
      expect(getGroup(goal({ safebuf: 1, todayta: false }))).toBe("next");
      expect(getGroup(goal({ safebuf: 6, todayta: false }))).toBe("next");
    });

    it("an untouched goal at the threshold is later", () => {
      // 7 is not < 7, so it tips into later.
      expect(getGroup(goal({ safebuf: 7, todayta: false }))).toBe("later");
    });

    it("an untouched goal well past the threshold is later", () => {
      expect(getGroup(goal({ safebuf: 30, todayta: false }))).toBe("later");
    });
  });

  describe("touched goals", () => {
    it("a touched goal under the threshold is later, not next", () => {
      // Having logged data today (todayta truthy) keeps it out of the "next"
      // attention bucket even with a small buffer.
      expect(getGroup(goal({ safebuf: 3, todayta: true }))).toBe("later");
    });

    it("a touched goal still counts as today when due", () => {
      // safebuf 0 is checked before the touched/next logic.
      expect(getGroup(goal({ safebuf: 0, todayta: true }))).toBe("today");
    });
  });
});
