import { describe, it, expect } from "vitest";
import goalKeyAction from "./goalKeyAction";

type EventOpts = {
  key: string;
  defaultPrevented?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  target?: { tagName?: string; isContentEditable?: boolean } | null;
};

function keyEvent(opts: EventOpts): KeyboardEvent {
  return {
    defaultPrevented: false,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    target: null,
    ...opts,
  } as unknown as KeyboardEvent;
}

describe("goalKeyAction", () => {
  it("maps a/d/Escape to pager actions", () => {
    expect(goalKeyAction(keyEvent({ key: "a" }))).toBe("prev");
    expect(goalKeyAction(keyEvent({ key: "d" }))).toBe("next");
    expect(goalKeyAction(keyEvent({ key: "Escape" }))).toBe("dashboard");
  });

  it("is case-insensitive", () => {
    expect(goalKeyAction(keyEvent({ key: "A" }))).toBe("prev");
    expect(goalKeyAction(keyEvent({ key: "D" }))).toBe("next");
  });

  it("returns null for unrelated keys", () => {
    expect(goalKeyAction(keyEvent({ key: "b" }))).toBeNull();
    expect(goalKeyAction(keyEvent({ key: "Enter" }))).toBeNull();
  });

  it("ignores modifier chords so browser shortcuts aren't hijacked", () => {
    expect(goalKeyAction(keyEvent({ key: "a", metaKey: true }))).toBeNull();
    expect(goalKeyAction(keyEvent({ key: "d", ctrlKey: true }))).toBeNull();
    expect(goalKeyAction(keyEvent({ key: "a", altKey: true }))).toBeNull();
  });

  it("ignores already-handled events", () => {
    expect(goalKeyAction(keyEvent({ key: "a", defaultPrevented: true }))).toBeNull();
  });

  it("ignores keys typed into form fields", () => {
    expect(
      goalKeyAction(keyEvent({ key: "a", target: { tagName: "INPUT" } }))
    ).toBeNull();
    expect(
      goalKeyAction(keyEvent({ key: "d", target: { tagName: "TEXTAREA" } }))
    ).toBeNull();
    expect(
      goalKeyAction(keyEvent({ key: "a", target: { isContentEditable: true } }))
    ).toBeNull();
  });
});
