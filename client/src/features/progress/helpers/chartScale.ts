import { addDays, diffDays } from "../../../shared/helpers/dateKey";

const STEPS = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100];

export type NiceScale = { min: number; max: number; ticks: number[] };

function roundTick(value: number) {
  return Math.round(value * 100) / 100;
}

export function niceScale(values: number[], targetTicks = 4): NiceScale {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = Math.max(high - low, 0.4);
  const step = STEPS.find((candidate) => range / candidate <= targetTicks - 1) ?? STEPS[STEPS.length - 1];
  let min = Math.floor(low / step) * step;
  let max = Math.ceil(high / step) * step;
  if (high - low < step) {
    min -= step;
    max += step;
  } else {
    if (low - min < step * 0.15) min -= step;
    if (max - high < step * 0.15) max += step;
  }
  const ticks: number[] = [];
  for (let tick = min; tick <= max + step / 2; tick += step) ticks.push(roundTick(tick));
  return { min: roundTick(min), max: roundTick(max), ticks };
}

export function axisDateTicks(first: string, last: string, maxTicks: number): string[] {
  const span = diffDays(first, last);
  if (span <= 0) return [first];
  const count = Math.min(maxTicks, span + 1);
  const dates = Array.from({ length: count }, (_, index) => addDays(first, Math.round((span * index) / (count - 1))));
  return [...new Set(dates)];
}
