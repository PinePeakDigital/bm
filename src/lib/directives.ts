import { Goal } from "../services/beeminder";

// The app stores its own per-goal configuration inside Beeminder's free-text
// `fineprint` field, encoded as `#bm...` tokens ("directives"). This module is
// the one place that knows that encoding — callers ask for the concept (is this
// goal pinned? what's its autodata?), not the regex.

// A bare flag directive, e.g. `#bmPin`. Matched as a whole token (trailing word
// boundary) so neighbours like `#bmPinned` don't count as `#bmPin`.
function hasFlag(g: Goal, name: string): boolean {
  return new RegExp(`#${name}\\b`).test(g.fineprint ?? "");
}

// A `#name=value` directive, e.g. `#bmAutodata=https://example.com`. Returns the
// value (up to the next whitespace), or undefined if the directive is absent.
function flagValue(g: Goal, name: string): string | undefined {
  return g.fineprint?.match(new RegExp(`#${name}=(\\S+)`))?.[1];
}

// Whether the user has pinned this goal: either a Beeminder "drinker" goal, or
// one explicitly tagged with `#bmPin` in its fineprint.
export function isPinned(g: Goal): boolean {
  return g.goal_type === "drinker" || hasFlag(g, "bmPin");
}

// The goal's autodata source: a custom refresh URL from `#bmAutodata=<url>`, or
// otherwise a boolean reflecting Beeminder's native autodata config.
export function getAutodata(g: Goal): boolean | string {
  return flagValue(g, "bmAutodata") || !!g.autodata;
}
