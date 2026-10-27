export type AppThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export const lightColors = {
  background: "#F6F5F2",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F0EC",
  surfaceElevated: "#FFFFFF",
  inputBackground: "#F7F6F3",

  textPrimary: "#1F2328",
  textSecondary: "#575E66",
  textMuted: "#686E76",

  border: "#E7E4DE",
  borderStrong: "#D3CFC7",

  accent: "#1F4E9C",
  accentStrong: "#173E7E",
  accentSoft: "#EAF0F9",
  accentBorder: "#B9CBEA",
  onAccent: "#FFFFFF",

  disabledBackground: "#E6E4DF",
  disabledText: "#9A9FA5",

  macroProtein: "#2F5FAE",
  macroCarbs: "#1D7A82",
  macroFat: "#8A5A9E",
  macroFiber: "#3E8565",

  danger: "#B93A32",
  dangerSoft: "#FBEDEB",
  success: "#2F7A52",
  successSoft: "#E8F3EC",
  warning: "#9A6312",
  warningSoft: "#FBF1E1",

  progressTrack: "#ECE9E3",
  overlay: "rgba(24, 26, 30, 0.42)",
  shadow: "#1F2328",
};

export type AppColors = typeof lightColors;

export const darkColors: AppColors = {
  background: "#141413",
  surface: "#1D1D1C",
  surfaceMuted: "#272725",
  surfaceElevated: "#353533",
  inputBackground: "#272725",

  textPrimary: "#EDECE8",
  textSecondary: "#B5B3AD",
  textMuted: "#8F8D87",

  border: "#2D2D2B",
  borderStrong: "#41403D",

  accent: "#84A5DF",
  accentStrong: "#AFC6EE",
  accentSoft: "rgba(132, 165, 223, 0.15)",
  accentBorder: "rgba(132, 165, 223, 0.38)",
  onAccent: "#0E1830",

  disabledBackground: "#2A2A28",
  disabledText: "#74726D",

  macroProtein: "#84A5DF",
  macroCarbs: "#6FC0C3",
  macroFat: "#B798C6",
  macroFiber: "#7FBE9D",

  danger: "#E98A80",
  dangerSoft: "rgba(233, 138, 128, 0.14)",
  success: "#82C3A0",
  successSoft: "rgba(130, 195, 160, 0.14)",
  warning: "#DDB06A",
  warningSoft: "rgba(221, 176, 106, 0.14)",

  progressTrack: "#2E2E2C",
  overlay: "rgba(0, 0, 0, 0.62)",
  shadow: "#000000",
};
