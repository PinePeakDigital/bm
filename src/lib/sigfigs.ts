// Round a number to two decimal places for display, preserving sign. (Despite
// the name this rounds to a fixed number of decimal places, not significant
// figures — kept as-is to match how the goal rate has always been shown.)
export default function sigfigs(n: number): number {
  const digits = 2;
  const isNegative = n < 0;
  const abs = Math.abs(n);
  const rounded = Math.round(abs * 10 ** digits) / 10 ** digits;
  return isNegative ? -rounded : rounded;
}
