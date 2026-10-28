const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export function isDayKey(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DAY_KEY_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}
