// Decide what a keydown should do on the goal page's pager, or null to leave
// the event alone. Centralising the guards keeps them testable: ignore
// already-handled events and modifier chords (Ctrl/⌘/Alt) so we don't hijack
// browser shortcuts, and don't fire while the user is typing in a field (e.g.
// the add-datapoint input on the goal page).
export type GoalKeyAction = "prev" | "next" | "dashboard" | null;

export default function goalKeyAction(e: KeyboardEvent): GoalKeyAction {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return null;

  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    return null;
  }

  const key = e.key.toLowerCase();
  if (key === "a") return "prev";
  if (key === "d") return "next";
  if (key === "escape") return "dashboard";
  return null;
}
