export type AppThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export const lightColors = {
  background: "#F6F7FA",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF0F5",
  surfaceElevated: "#FFFFFF",
  inputBackground: "#FFFFFF",

  textPrimary: "#191C26",
  textSecondary: "#586176",
  textMuted: "#626B80",

  border: "#E2E5EC",
  borderStrong: "#C5CAD6",

  accent: "#365CF5",
  accentStrong: "#2445C9",
  accentSoft: "#EDF1FE",
  accentBorder: "#B9C7FB",
  accentFill: "#365CF5",
  accentFillPressed: "#2445C9",
  onAccent: "#FFFFFF",

  disabledBackground: "#E7E9EF",
  disabledText: "#8C93A3",

  macroProtein: "#365CF5",
  macroCarbs: "#0F7F8C",
  macroFat: "#9A5B13",
  macroFiber: "#08775A",

  danger: "#B42318",
  dangerSoft: "#FDECEA",
  dangerFill: "#B42318",
  dangerFillPressed: "#8F1C13",
  success: "#08775A",
  successSoft: "#DDF7ED",
  warning: "#8F5A06",
  warningSoft: "#FCF1DC",

  progressTrack: "#E4E7EE",
  progressFarStart: "#365CF5",
  progressFarEnd: "#6985F7",
  progressNearStart: "#16866A",
  progressNearEnd: "#45B58D",
  progressOverStart: "#C34764",
  progressOverEnd: "#E77C91",
  glassSurface: "rgba(255, 255, 255, 0.82)",
  glassBorder: "rgba(25, 28, 38, 0.08)",
  glassHighlight: "rgba(255, 255, 255, 0.95)",
  overlay: "rgba(25, 28, 38, 0.48)",
  shadow: "#191C26",
};

export type AppColors = typeof lightColors;

export const darkColors: AppColors = {
  background: "#0E1014",
  surface: "#181B21",
  surfaceMuted: "#22262E",
  surfaceElevated: "#2A2E37",
  inputBackground: "#131519",

  textPrimary: "#F1F2F5",
  textSecondary: "#ADB3BF",
  textMuted: "#8E95A2",

  border: "#2A2E37",
  borderStrong: "#3E4350",

  accent: "#5271FF",
  accentStrong: "#5271FF",
  accentSoft: "rgba(82, 113, 255, 0.16)",
  accentBorder: "rgba(82, 113, 255, 0.5)",
  accentFill: "#5271FF",
  accentFillPressed: "#3F5EEB",
  onAccent: "#FFFFFF",

  disabledBackground: "#252930",
  disabledText: "#727987",

  macroProtein: "#5271FF",
  macroCarbs: "#5CC4CE",
  macroFat: "#E0A65A",
  macroFiber: "#6FD3AE",

  danger: "#F2978E",
  dangerSoft: "rgba(242, 151, 142, 0.13)",
  dangerFill: "#D63A40",
  dangerFillPressed: "#B92E34",
  success: "#6FD3AE",
  successSoft: "rgba(111, 211, 174, 0.13)",
  warning: "#E2B566",
  warningSoft: "rgba(226, 181, 102, 0.13)",

  progressTrack: "#24272F",
  progressFarStart: "#5271FF",
  progressFarEnd: "#7D94FF",
  progressNearStart: "#20DFA0",
  progressNearEnd: "#8AFFCE",
  progressOverStart: "#FF426D",
  progressOverEnd: "#FF91AA",
  glassSurface: "rgba(34, 38, 47, 0.82)",
  glassBorder: "rgba(255, 255, 255, 0.07)",
  glassHighlight: "rgba(255, 255, 255, 0.10)",
  overlay: "rgba(0, 0, 0, 0.66)",
  shadow: "#000000",
};
