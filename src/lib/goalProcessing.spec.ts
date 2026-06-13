import { describe, it, expect } from "vitest";
import { Goal } from "../services/beeminder";
import { isProcessing, markProcessing } from "./goalProcessing";

function goal(props: Partial<Goal>): Goal {
  return props as Goal;
}

describe("isProcessing", () => {
  it("is true for a queued goal", () => {
    expect(isProcessing(goal({ queued: true }))).toBe(true);
  });

  it("is false for an unqueued goal", () => {
    expect(isProcessing(goal({ queued: false }))).toBe(false);
  });

  it("coerces a missing queued flag to false", () => {
    expect(isProcessing(goal({}))).toBe(false);
  });
});

describe("markProcessing", () => {
  it("marks the goal as processing", () => {
    expect(markProcessing(goal({ slug: "a", queued: false })).queued).toBe(true);
  });

  it("does not mutate the original goal", () => {
    const g = goal({ slug: "a", queued: false });
    const marked = markProcessing(g);

    expect(g.queued).toBe(false);
    expect(marked).not.toBe(g);
  });

  it("preserves the rest of the goal", () => {
    const marked = markProcessing(goal({ slug: "a", safebuf: 3 }));

    expect(marked.slug).toBe("a");
    expect(marked.safebuf).toBe(3);
  });
});
