import { describe, it, expect } from "vitest";
import breakDatesUrl from "./breakDatesUrl";

describe("breakDatesUrl", () => {
  it("builds the breaks URL for two valid dates", () => {
    expect(breakDatesUrl("2026-06-13", "2026-06-20")).toBe(
      "https://beeminder.com/breaks?start=2026-06-13&finish=2026-06-20"
    );
  });

  it("returns null when the start date is malformed", () => {
    expect(breakDatesUrl("6/13/2026", "2026-06-20")).toBeNull();
  });

  it("returns null when the finish date is malformed", () => {
    expect(breakDatesUrl("2026-06-13", "")).toBeNull();
  });

  it("returns null when both dates are empty (cancelled prompts)", () => {
    expect(breakDatesUrl("", "")).toBeNull();
  });
});
