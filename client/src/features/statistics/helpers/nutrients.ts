import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type { AppColors } from "../../../shared/theme/colors";
import { macroColor } from "../../../shared/helpers/macroColors";
import { MACRO_CONFIG } from "../../day-log/constants/macros";
import { NutrientKey } from "../types";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type NutrientMeta = {
  key: NutrientKey;
  icon: IconName;
  unit: "kcal" | "g";
  color: string;
};

type Visibility = { showCarbs: boolean; showFat: boolean; showFiber: boolean };

export function enabledNutrients(visibility: Visibility, colors: AppColors): NutrientMeta[] {
  const all: NutrientMeta[] = [
    { key: "calories", icon: "fire", unit: "kcal", color: colors.accent },
    { key: "protein", icon: MACRO_CONFIG.protein.icon, unit: "g", color: macroColor("protein", colors) },
    { key: "carbs", icon: MACRO_CONFIG.carbs.icon, unit: "g", color: macroColor("carbs", colors) },
    { key: "fat", icon: MACRO_CONFIG.fat.icon, unit: "g", color: macroColor("fat", colors) },
    { key: "fiber", icon: MACRO_CONFIG.fiber.icon, unit: "g", color: macroColor("fiber", colors) },
  ];
  return all.filter(
    (item) =>
      (item.key !== "carbs" || visibility.showCarbs) &&
      (item.key !== "fat" || visibility.showFat) &&
      (item.key !== "fiber" || visibility.showFiber),
  );
}

export function formatStat(value: number, unit: "kcal" | "g") {
  if (unit === "kcal") return Math.round(value).toLocaleString("en-US");
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function compactNumber(value: number) {
  if (value >= 1000) {
    const k = Math.round(value / 100) / 10;
    return `${k}k`;
  }
  return String(Math.round(value));
}

export function percentOf(value: number, target: number) {
  return target > 0 ? Math.round((value / target) * 100) : 0;
}

export function dayDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}
