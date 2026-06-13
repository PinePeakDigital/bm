import { Goal } from "../services/beeminder";

// A goal is "processing" while Beeminder works a queued datapoint: the API sets
// `queued` server-side, and we set it optimistically the moment a mutation
// fires. This module is the one place that knows that field, so the goals poll
// interval (which speeds up while anything is processing) and the optimistic
// cache update can't drift on what "processing" means.

// Whether Beeminder is still working a queued datapoint for this goal.
export function isProcessing(g: Goal): boolean {
  return !!g.queued;
}

// Optimistically mark a goal as processing, before the server confirms. Returns
// a new goal; never mutates the input.
export function markProcessing(g: Goal): Goal {
  return { ...g, queued: true };
}
