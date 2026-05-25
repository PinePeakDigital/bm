import { describe, it, expect } from "vitest";
import { Goal } from "../services/beeminder";
import { isPinned, getAutodata } from "./directives";

function goal(props: Partial<Goal>): Goal {
  return props as Goal;
}

describe("isPinned", () => {
  it("pins Beeminder 'drinker' goals", () => {
    expect(isPinned(goal({ goal_type: "drinker" }))).toBe(true);
  });

  it("pins goals tagged with #bmPin in fineprint", () => {
    expect(isPinned(goal({ fineprint: "some notes #bmPin here" }))).toBe(true);
  });

  it("does not pin an ordinary goal", () => {
    expect(isPinned(goal({ goal_type: "hustler", fineprint: "no tags" }))).toBe(
      false
    );
  });

  it("does not pin (and does not throw) when fineprint is missing", () => {
    expect(isPinned(goal({ goal_type: "hustler" }))).toBe(false);
  });
});

describe("getAutodata", () => {
  it("returns the URL from a #bmAutodata= directive", () => {
    expect(
      getAutodata(goal({ fineprint: "#bmAutodata=https://example.com/hook" }))
    ).toBe("https://example.com/hook");
  });

  it("prefers the #bmAutodata directive over native autodata", () => {
    expect(
      getAutodata(
        goal({ fineprint: "#bmAutodata=https://example.com", autodata: "ifttt" })
      )
    ).toBe("https://example.com");
  });

  it("returns true when only native autodata is configured", () => {
    expect(getAutodata(goal({ autodata: "ifttt" }))).toBe(true);
  });

  it("returns false when there is no autodata of any kind", () => {
    expect(getAutodata(goal({ fineprint: "no directives here" }))).toBe(false);
  });

  it("returns false (and does not throw) when fineprint is missing", () => {
    expect(getAutodata(goal({}))).toBe(false);
  });
});
