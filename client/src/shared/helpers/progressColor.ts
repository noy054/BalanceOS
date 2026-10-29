import { AppColors } from "../theme";

export type ProgressGradient = readonly [start: string, end: string];

export const NEAR_TARGET_RATIO = 0.7;

export function progressGradient(ratio: number, colors: AppColors, isOver = false): ProgressGradient {
  if (isOver) return [colors.progressOverStart, colors.progressOverEnd];
  if (ratio >= NEAR_TARGET_RATIO) return [colors.progressNearStart, colors.progressNearEnd];
  return [colors.progressFarStart, colors.progressFarEnd];
}

function toRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function mixColors(from: string, to: string, amount: number) {
  const a = toRgb(from);
  const b = toRgb(to);
  const weight = Math.min(Math.max(amount, 0), 1);
  const channel = (index: number) =>
    Math.round(a[index] + (b[index] - a[index]) * weight)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}
