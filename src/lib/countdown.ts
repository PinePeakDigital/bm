import { Goal } from "../services/beeminder";
import { formatClocky } from "./clocky";

// The math behind the goal countdown: how long until a goal derails, which time
// unit to show that in, and the rate prefix parsed from Beeminder's `baremin`.
// The Countdown component owns only the rendering and the tick scheduling.

// Seconds in each display unit, smallest to largest. Order matters: findUnit
// walks these in order and picks the largest unit the remaining time exceeds.
export const Unit: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
  w: 60 * 60 * 24 * 7,
  y: 60 * 60 * 24 * 365,
};

// The largest unit that `seconds` exceeds, or undefined when under a second.
export function findUnit(seconds: number): keyof typeof Unit | undefined {
  return Object.keys(Unit).findLast((u) => seconds > Unit[u]);
}

// Seconds remaining until a goal's losedate; negative once it has passed.
// `now` is injectable so the calculation is testable.
export function secondsUntil(losedate: number, now: Date = new Date()): number {
  return (losedate * 1000 - now.getTime()) / 1000;
}

// The rate prefix shown before the countdown. For clocky (hhmmformat) goals we
// format the raw decimal amount from `limsum` ourselves, rounding partial
// minutes up so the grid never reads less than the goal detail page — which
// clockifies the same decimal — and stays pessimistic. Beeminder's own
// `baremin` rounds to the nearest minute (0.0912h → "0:05", not "0:06"), so we
// don't trust it for clocky goals. For other goals we show `baremin` directly.
export function getPrefix(
  g: Pick<Goal, "baremin" | "limsum" | "hhmmformat">
): string {
  if (g.hhmmformat) {
    const amount = g.limsum.match(/^[+-]?\d+(\.\d+)?/)?.[0];
    return `${amount ? formatClocky(Number(amount), true) : ""} in`;
  }
  const sign = g.baremin.includes("-") ? "-" : "";
  const number = g.baremin.match(/(\d+\.?\d?\d?)/)?.[1] || "";
  return `${sign}${number} in`;
}
