import { describe, it, expect } from "vitest";
import filterGoals from "./filterGoals";
import { Goal } from "../services/beeminder";

const goals = [
  { slug: "weight" },
  { slug: "running" },
  { slug: "read-books" },
] as Goal[];

describe("filterGoals", () => {
  it("returns all goals when the filter is empty", () => {
    expect(filterGoals(goals, "")).toBe(goals);
  });

  it("matches by regex for valid patterns", () => {
    expect(filterGoals(goals, "run|read").map((g) => g.slug)).toEqual([
      "running",
      "read-books",
    ]);
  });

  it("matches case-insensitively for valid patterns", () => {
    expect(filterGoals(goals, "WEIGHT").map((g) => g.slug)).toEqual(["weight"]);
  });

  it("does not throw on an invalid regex", () => {
    // A lone "[" is an invalid pattern that would throw from `new RegExp`.
    expect(() => filterGoals(goals, "[")).not.toThrow();
  });

  it("falls back to a literal substring match when the pattern is invalid", () => {
    const data = [{ slug: "a(b" }, { slug: "other" }] as Goal[];
    // "a(" is an invalid regex (unterminated group), but the literal substring
    // "a(" still matches the "a(b" slug via the fallback.
    expect(filterGoals(data, "a(").map((g) => g.slug)).toEqual(["a(b"]);
  });

  it("substring fallback is case-insensitive", () => {
    const data = [{ slug: "Foo(Bar" }] as Goal[];
    // "FOO(" is an invalid regex → substring fallback, lowercased on both sides.
    expect(filterGoals(data, "FOO(").map((g) => g.slug)).toEqual(["Foo(Bar"]);
  });
});
