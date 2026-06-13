import { describe, it, expect } from "vitest";
import parseDatapointValue from "./parseDatapointValue";

describe("parseDatapointValue", () => {
  it("parses a plain number", () => {
    expect(parseDatapointValue("5")).toBe(5);
    expect(parseDatapointValue("1.5")).toBe(1.5);
  });

  it("parses an h:mm time as fractional hours", () => {
    expect(parseDatapointValue("1:30")).toBe(1.5);
    expect(parseDatapointValue("0:15")).toBe(0.25);
    expect(parseDatapointValue("2:00")).toBe(2);
  });

  it("treats an empty hours part as zero", () => {
    expect(parseDatapointValue(":30")).toBe(0.5);
  });

  it("treats an empty minutes part as zero (trailing colon)", () => {
    expect(parseDatapointValue("1:")).toBe(1);
  });

  it("returns NaN for unparseable input", () => {
    expect(parseDatapointValue("abc")).toBeNaN();
  });
});
