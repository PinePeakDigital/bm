import { describe, it, expect } from "vitest";
import sigfigs from "./sigfigs";

describe("sigfigs", () => {
  it("rounds to two decimal places", () => {
    expect(sigfigs(1.234)).toBe(1.23);
    expect(sigfigs(1.236)).toBe(1.24);
  });

  it("leaves shorter decimals and whole numbers unchanged", () => {
    expect(sigfigs(1.2)).toBe(1.2);
    expect(sigfigs(5)).toBe(5);
  });

  it("preserves the sign of negative numbers", () => {
    expect(sigfigs(-1.234)).toBe(-1.23);
  });

  it("rounds zero to zero", () => {
    expect(sigfigs(0)).toBe(0);
  });
});
