export type AppThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export const darkColors = {
  background: "#0B0D0B",
  backgroundSoft: "#121612",

  cardBackground: "rgba(18, 22, 19, 0.96)",
  cardBackgroundSoft: "rgba(255, 255, 255, 0.07)",
  cardBackgroundStrong: "rgba(10, 13, 11, 0.98)",

  inputBackground: "rgba(255, 255, 255, 0.06)",

  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.68)",
  textMuted: "rgba(255, 255, 255, 0.42)",

  border: "rgba(255, 255, 255, 0.10)",
  borderStrong: "rgba(255, 255, 255, 0.16)",

  primaryGreen: "#31D86B",
  primaryGreenDark: "#1E9B4A",
  primaryGreenLight: "rgba(49, 216, 107, 0.13)",
  primaryGreenMid: "rgba(49, 216, 107, 0.42)",

  accentLime: "#B7F34A",
  accentLimeLight: "rgba(183, 243, 74, 0.12)",

  macroProtein: "#31D86B",
  macroCarbs: "#2FB7A3",
  macroFat: "#F2A33A",
  macroFiber: "#8AD66D",

  accentBerry: "#B02A63",
  accentBerryLight: "rgba(176, 42, 99, 0.14)",

  danger: "#F84B6A",
  dangerLight: "rgba(248, 75, 106, 0.13)",
  success: "#31D86B",
  successLight: "rgba(49, 216, 107, 0.14)",

  progressTrack: "rgba(255, 255, 255, 0.12)",
  shadow: "rgba(0, 0, 0, 0.56)",
};

export const lightColors = {
  background: "#F6F8F4",
  backgroundSoft: "#EEF3EA",

  cardBackground: "#FFFFFF",
  cardBackgroundSoft: "rgba(11, 13, 11, 0.05)",
  cardBackgroundStrong: "#F1F5EF",

  inputBackground: "rgba(11, 13, 11, 0.05)",

  textPrimary: "#101510",
  textSecondary: "rgba(16, 21, 16, 0.68)",
  textMuted: "rgba(16, 21, 16, 0.42)",

  border: "rgba(16, 21, 16, 0.10)",
  borderStrong: "rgba(16, 21, 16, 0.16)",

  primaryGreen: "#1FAE5B",
  primaryGreenDark: "#147A3E",
  primaryGreenLight: "rgba(31, 174, 91, 0.12)",
  primaryGreenMid: "rgba(31, 174, 91, 0.36)",

  accentLime: "#91D93C",
  accentLimeLight: "rgba(145, 217, 60, 0.12)",

  macroProtein: "#1FAE5B",
  macroCarbs: "#229C8E",
  macroFat: "#D88A1F",
  macroFiber: "#6DBF55",

  accentBerry: "#A7265C",
  accentBerryLight: "rgba(167, 38, 92, 0.12)",

  danger: "#E03D5C",
  dangerLight: "rgba(224, 61, 92, 0.12)",
  success: "#1FAE5B",
  successLight: "rgba(31, 174, 91, 0.12)",

  progressTrack: "rgba(16, 21, 16, 0.10)",
  shadow: "rgba(16, 21, 16, 0.14)",
};

export type AppColors = typeof darkColors;

// Backward compatibility: old screens that import `colors` still get dark theme.
export const colors = darkColors;
