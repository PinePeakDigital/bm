// Formatting for "clocky" goals (Beeminder's hhmmformat), whose values are
// decimal hours that read better as clock time: 0.08289 → "0:05", 1.5 → "1:30".

// Decimal hours → "H:MM", rounding to the nearest minute and preserving sign.
// Used for datapoint values, which are exact logged amounts.
export function formatClocky(hours: number): string {
  const totalMinutes = Math.round(Math.abs(hours) * 60);
  const sign = hours < 0 && totalMinutes > 0 ? "-" : "";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${sign}${h}:${m.toString().padStart(2, "0")}`;
}

// Beeminder reports the clocky amount due (baremin) as a signed "HH:MM:SS"
// string, precise to the second: "+00:06:00", "+00:06:01". Reformat to "H:MM",
// rounding any partial minute UP so the amount never reads as less than what's
// actually required ("00:06:01" → "0:07"). Returns "" when there's no clock
// value. We use this rather than limsum's leading number, which is unreliable
// for clocky goals — Beeminder may print "+1" for a six-minute amount.
export function formatClockyClock(clock: string): string {
  const m = clock.match(/(-)?(\d+):(\d+):(\d+)/);
  if (!m) return "";
  const totalMinutes = Math.ceil((+m[2] * 3600 + +m[3] * 60 + +m[4]) / 60);
  const sign = m[1] && totalMinutes > 0 ? "-" : "";
  const h = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${sign}${h}:${min.toString().padStart(2, "0")}`;
}

// Rewrite the leading numeric amount of a limsum/limsumdate string ("+1 due Mon
// by 13:00") with the clocky amount due taken from `baremin` ("+00:06:00" →
// "+0:06"), keeping the string's own leading sign and leaving the "due …" tail
// untouched.
export function clockifyLimsum(limsum: string, baremin: string): string {
  const amount = formatClockyClock(baremin).replace(/^[+-]/, "");
  return limsum.replace(
    /^([+-]?)\d+(\.\d+)?/,
    (_m, sign: string) => `${sign}${amount}`
  );
}
