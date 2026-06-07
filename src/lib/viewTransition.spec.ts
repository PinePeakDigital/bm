import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isPlainLeftClick,
  startViewTransition,
  markInternalNavigation,
  hasInternalHistory,
} from "./viewTransition";

function clickEvent(overrides: Partial<MouseEvent>): MouseEvent {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  } as MouseEvent;
}

describe("isPlainLeftClick", () => {
  it("is true for a primary-button click with no modifiers", () => {
    expect(isPlainLeftClick(clickEvent({}))).toBe(true);
  });

  it("is false for non-primary buttons (middle/right)", () => {
    expect(isPlainLeftClick(clickEvent({ button: 1 }))).toBe(false);
    expect(isPlainLeftClick(clickEvent({ button: 2 }))).toBe(false);
  });

  it("is false when any modifier key is held", () => {
    expect(isPlainLeftClick(clickEvent({ metaKey: true }))).toBe(false);
    expect(isPlainLeftClick(clickEvent({ ctrlKey: true }))).toBe(false);
    expect(isPlainLeftClick(clickEvent({ shiftKey: true }))).toBe(false);
    expect(isPlainLeftClick(clickEvent({ altKey: true }))).toBe(false);
  });
});

describe("startViewTransition", () => {
  afterEach(() => {
    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });

  it("runs the update directly when the API is unavailable", () => {
    // happy-dom has no startViewTransition by default.
    const update = vi.fn();
    startViewTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("delegates to document.startViewTransition when available", () => {
    const update = vi.fn();
    const start = vi.fn((cb: () => void) => cb());
    (document as { startViewTransition?: unknown }).startViewTransition = start;

    startViewTransition(update);

    expect(start).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe("internal navigation latch", () => {
  it("starts false and latches true once marked", () => {
    // Order matters: the flag is a module-global, one-way latch, so assert the
    // initial state before flipping it.
    expect(hasInternalHistory()).toBe(false);
    markInternalNavigation();
    expect(hasInternalHistory()).toBe(true);
  });
});
