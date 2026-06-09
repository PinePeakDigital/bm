import { Goal } from "../services/beeminder";

// Filter goals by the dashboard search box. The query doubles as a regex for
// power users, but a half-typed pattern (e.g. a lone "[") makes the RegExp
// constructor throw — so we fall back to a plain case-insensitive substring
// match on the slug instead of letting the page crash.
export default function filterGoals(goals: Goal[], filter: string): Goal[] {
  if (!filter) return goals;

  let r: RegExp | null = null;
  try {
    r = new RegExp(filter, "i");
  } catch {
    r = null;
  }

  return goals.filter((g) =>
    r ? r.test(g.slug) : g.slug.toLowerCase().includes(filter.toLowerCase())
  );
}
