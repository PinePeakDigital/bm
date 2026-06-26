// Formatting for "clocky" goals (Beeminder's hhmmformat), whose values are
// decimal hours that read better as clock time: 0.08289 → "0:05", 1.5 → "1:30".

// Decimal hours → "H:MM", preserving sign and zero-padding minutes.
export function formatClocky(hours: number): string {
  const sign = hours < 0 ? "-" : "";
  const totalMinutes = Math.round(Math.abs(hours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${sign}${h}:${m.toString().padStart(2, "0")}`;
}

// Rewrite the leading numeric value of a limsum/limsumdate string in clocky form,
// leaving the rest ("due Sat by 09:00") untouched. Keeps an explicit leading "+".
export function clockifyLimsum(limsum: string): string {
  return limsum.replace(/^[+-]?\d+(\.\d+)?/, (m) => {
    const s = formatClocky(Number(m));
    return m.startsWith("+") && !s.startsWith("-") ? `+${s}` : s;
  });
}
