import { AppColors } from "../../../shared/theme";

export type MacroKey = "protein" | "carbs" | "fat" | "fiber";

export function macroColor(key: MacroKey, colors: AppColors) {
  const palette: Record<MacroKey, string> = {
    protein: colors.macroProtein,
    carbs: colors.macroCarbs,
    fat: colors.macroFat,
    fiber: colors.macroFiber,
  };
  return palette[key];
}
