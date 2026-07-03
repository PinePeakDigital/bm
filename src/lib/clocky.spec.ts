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

  it("does not emit a signed zero for tiny negatives", () => {
    expect(formatClocky(-0.001)).toBe("0:00");
    expect(formatClocky(0)).toBe("0:00");
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

  it("handles an integer leading value", () => {
    expect(clockifyLimsum("+5 due Sat")).toBe("+5:00 due Sat");
  });

  it("rounds the amount due up to the next minute", () => {
    // 00:05:01 required (0.083611 h) must not read as 0:05
    expect(clockifyLimsum("+0.083611 due Sat")).toBe("+0:06 due Sat");
  });

  it("rounds up by magnitude for negative fractional values", () => {
    expect(clockifyLimsum("-0.083611 due Sat")).toBe("-0:06 due Sat");
  });

  it("leaves strings with no leading value untouched", () => {
    expect(clockifyLimsum("due Sat")).toBe("due Sat");
  });
});
