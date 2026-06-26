import { describe, it, expect } from "vitest";
import { formatClocky, clockifyLimsum } from "./clocky";

describe("formatClocky", () => {
  it("formats decimal hours as H:MM", () => {
    expect(formatClocky(1.5)).toBe("1:30");
    expect(formatClocky(0.08289)).toBe("0:05");
    expect(formatClocky(2)).toBe("2:00");
  });

  it("preserves the sign of negative values", () => {
    expect(formatClocky(-2.5)).toBe("-2:30");
  });

  it("rounds to the nearest minute", () => {
    expect(formatClocky(0.119)).toBe("0:07");
  });
});

describe("clockifyLimsum", () => {
  it("rewrites the leading value, keeping the rest", () => {
    expect(clockifyLimsum("+0.08289 due Sat by 09:00")).toBe(
      "+0:05 due Sat by 09:00"
    );
  });

  it("preserves a negative sign", () => {
    expect(clockifyLimsum("-2.5 within 1 day")).toBe("-2:30 within 1 day");
  });

  it("handles an unsigned leading value", () => {
    expect(clockifyLimsum("1.5 due Sat")).toBe("1:30 due Sat");
  });
});
