// Parse a value typed into the datapoint input. Beeminder "hh:mm" goals accept
// a clock-style entry ("1:30" → 1.5 hours); everything else is a plain number.
// Returns NaN for unparseable input, so callers can guard with Number.isFinite.
export default function parseDatapointValue(value: string): number {
  if (value.includes(":")) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours + minutes / 60;
  }
  return Number(value);
}
