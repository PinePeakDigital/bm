import { describe, it, expect } from "vitest";
import buildHref from "./buildHref";

describe("buildHref", () => {
  it("returns paths without placeholders unchanged", () => {
    expect(buildHref("/")).toBe("/");
    expect(buildHref("/goals")).toBe("/goals");
  });

  it("substitutes a single placeholder", () => {
    expect(buildHref("/goal/$slug", { slug: "weight" })).toBe("/goal/weight");
  });

  it("substitutes multiple placeholders", () => {
    expect(buildHref("/x/$a/$b", { a: "1", b: "2" })).toBe("/x/1/2");
  });

  it("URL-encodes values", () => {
    expect(buildHref("/goal/$slug", { slug: "a/b c" })).toBe(
      "/goal/a%2Fb%20c"
    );
  });

  it("renders a missing param as an empty segment rather than the placeholder", () => {
    expect(buildHref("/goal/$slug", {})).toBe("/goal/");
    expect(buildHref("/goal/$slug")).toBe("/goal/");
  });
});
