export function formatCalories(value: number | null | undefined): string {
  return String(Math.round(Number(value) || 0));
}

export function formatGrams(value: number | null | undefined): string {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
