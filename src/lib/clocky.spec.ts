import { describe, it, expect } from "vitest";
import { formatClocky, formatClockyClock, clockifyLimsum } from "./clocky";

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

describe("formatClockyClock", () => {
  it("reformats a second-precise HH:MM:SS amount to H:MM", () => {
    expect(formatClockyClock("+00:06:00")).toBe("0:06");
    expect(formatClockyClock("+00:57:01")).toBe("0:58");
    expect(formatClockyClock("+01:30:00")).toBe("1:30");
  });

  it("rounds any partial minute up", () => {
    // 00:06:01 required must not read as 0:06
    expect(formatClockyClock("+00:06:01")).toBe("0:07");
    expect(formatClockyClock("+00:04:16")).toBe("0:05");
  });

  it("preserves a negative sign", () => {
    expect(formatClockyClock("-00:06:00")).toBe("-0:06");
  });

  it("never emits a signed zero", () => {
    expect(formatClockyClock("-00:00:00")).toBe("0:00");
    expect(formatClockyClock("+00:00:00")).toBe("0:00");
  });

  it("returns an empty string when there's no clock value", () => {
    expect(formatClockyClock("")).toBe("");
    expect(formatClockyClock("1.5")).toBe("");
  });
});

describe("clockifyLimsum", () => {
  it("rewrites the leading value from baremin, keeping the rest", () => {
    // limsum's own "+1" is unreliable; the amount comes from baremin.
    expect(clockifyLimsum("+1 due Sat by 09:00", "+00:06:00")).toBe(
      "+0:06 due Sat by 09:00"
    );
  });

  it("preserves a negative sign", () => {
    expect(clockifyLimsum("-2.5 within 1 day", "-00:06:00")).toBe(
      "-0:06 within 1 day"
    );
  });

  it("handles an unsigned leading value", () => {
    expect(clockifyLimsum("1.5 due Sat", "+01:30:00")).toBe("1:30 due Sat");
  });

  it("rounds the amount due up to the next minute", () => {
    // 00:06:01 required must not read as 0:06
    expect(clockifyLimsum("+1 due Sat", "+00:06:01")).toBe("+0:07 due Sat");
  });

  it("leaves strings with no leading value untouched", () => {
    expect(clockifyLimsum("due Sat", "+00:06:00")).toBe("due Sat");
  });
});
