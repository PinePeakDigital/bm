// The "Add breaks" action asks for a start and finish date and sends the user
// to Beeminder's breaks page for that range. This is the pure, testable core:
// validate the two dates and build the (un-authenticated) breaks URL, or return
// null if either date isn't `YYYY-MM-DD`. The prompts, the auth-wrapping, and
// the window it opens stay in the caller — only this validation/encoding lives
// here, matching the buildHref/goalKeyAction "logic in lib, side effects in the
// component" split.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function breakDatesUrl(
  start: string,
  finish: string
): string | null {
  if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(finish)) return null;
  return `https://beeminder.com/breaks?start=${start}&finish=${finish}`;
}
