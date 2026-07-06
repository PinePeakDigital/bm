import { Goal } from "../services/beeminder";
import { formatClockyClock } from "./clocky";

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
// reformat Beeminder's `baremin` — a second-precise "HH:MM:SS" amount due — to
// "H:MM", rounding partial minutes up so we stay pessimistic. We can't use
// limsum's leading number here: it's unreliable for clocky goals (Beeminder may
// print "+1" for a six-minute amount). For other goals we show `baremin`
// directly.
export function getPrefix(
  g: Pick<Goal, "baremin" | "hhmmformat">
): string {
  if (g.hhmmformat) {
    return `${formatClockyClock(g.baremin)} in`;
  }
  const sign = g.baremin.includes("-") ? "-" : "";
  const number = g.baremin.match(/(\d+\.?\d?\d?)/)?.[1] || "";
  return `${sign}${number} in`;
}
