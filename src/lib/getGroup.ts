import { Goal } from "../services/beeminder";
import { isPinned } from "./directives";

const LATER_BUFFER_THRESHOLD = 7;

function isDue(g: Goal): boolean {
  return g.safebuf === 0;
}

function isTouched(g: Goal): boolean {
  return !!g.todayta;
}

export function getGroup(g: Goal): "pinned" | "today" | "next" | "later" {
  if (isPinned(g)) return "pinned";
  if (isDue(g)) return "today";
  if (!isTouched(g) && g.safebuf < LATER_BUFFER_THRESHOLD) return "next";
  return "later";
}
