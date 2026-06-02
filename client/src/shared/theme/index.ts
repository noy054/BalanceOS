import { ViewStyle } from "react-native";

export { colors, darkColors, lightColors } from "./colors";
export type { AppColors, AppThemeMode } from "./colors";
export { AppThemeProvider, useAppTheme } from "./ThemeProvider";

export const spacing = {
  xs: 4,
  sm: 8,
  sm2: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 36,
  full: 999,
};

export const cardShadow: ViewStyle = {
  shadowColor: "rgba(0, 0, 0, 0.70)",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 18,
  elevation: 6,
};

export const cardShadowMd: ViewStyle = {
  shadowColor: "rgba(0, 0, 0, 0.70)",
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 1,
  shadowRadius: 28,
  elevation: 10,
};
