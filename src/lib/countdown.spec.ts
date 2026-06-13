import { describe, it, expect } from "vitest";
import { findUnit, secondsUntil, getPrefix } from "./countdown";

describe("findUnit", () => {
  it("picks the largest unit the duration exceeds", () => {
    expect(findUnit(30)).toBe("s"); // > 1s, not > 1m
    expect(findUnit(90)).toBe("m"); // > 1m, not > 1h
    expect(findUnit(60 * 60 * 2)).toBe("h"); // just over an hour
    expect(findUnit(60 * 60 * 25)).toBe("d"); // just over a day
    expect(findUnit(60 * 60 * 24 * 8)).toBe("w"); // just over a week
    expect(findUnit(60 * 60 * 24 * 366)).toBe("y"); // just over a year
  });

  it("is undefined for under a second", () => {
    expect(findUnit(0.5)).toBeUndefined();
    expect(findUnit(0)).toBeUndefined();
  });
});

describe("secondsUntil", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("returns the seconds remaining until the losedate", () => {
    expect(secondsUntil(now.getTime() / 1000 + 120, now)).toBe(120);
  });

  it("is negative once the losedate has passed", () => {
    expect(secondsUntil(now.getTime() / 1000 - 60, now)).toBe(-60);
  });
});

describe("getPrefix", () => {
  it("formats a bare number", () => {
    expect(getPrefix("1")).toBe("1 in");
    expect(getPrefix("1.5")).toBe("1.5 in");
  });

  it("prefers an h:mm time over a number", () => {
    expect(getPrefix("2:30")).toBe("2:30 in");
  });

  it("keeps a leading minus sign", () => {
    expect(getPrefix("-3")).toBe("-3 in");
    expect(getPrefix("-1:15")).toBe("-1:15 in");
  });

  it("degrades to a bare ' in' for an empty baremin", () => {
    expect(getPrefix("")).toBe(" in");
  });
});
