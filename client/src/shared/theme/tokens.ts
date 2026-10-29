import { TextStyle, ViewStyle } from "react-native";

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  sm2: 10,
  ms: 12,
  md: 16,
  ml: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 16,
  xl: 16,
  xxl: 20,
  full: 8,
  round: 999,
};

export const fonts = {
  regular: "Heebo_400Regular",
  medium: "Heebo_500Medium",
  semibold: "Heebo_600SemiBold",
  bold: "Heebo_700Bold",
  headingMedium: "Rubik_500Medium",
  headingSemibold: "Rubik_600SemiBold",
  headingBold: "Rubik_700Bold",
};

const tabularNums: TextStyle["fontVariant"] = ["tabular-nums"];

export const typography = {
  display: {
    fontFamily: fonts.semibold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
    fontVariant: tabularNums,
  },
  title: {
    fontFamily: fonts.headingSemibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  headline: {
    fontFamily: fonts.headingMedium,
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  callout: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  footnote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  overline: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  value: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 24,
    fontVariant: tabularNums,
  },
  number: {
    fontVariant: tabularNums,
  },
} satisfies Record<string, TextStyle>;

const flatShadow = {
  shadowColor: "transparent",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

export const shadows = {
  sm: flatShadow,
  md: {
    shadowColor: "#191C26",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: "#191C26",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
} satisfies Record<string, ViewStyle>;

export const states = {
  pressedOpacity: 0.7,
  disabledOpacity: 0.45,
};

export const layout = {
  screenGutter: spacing.md,
  touchTarget: 44,
  headerHeight: 52,
  tabBarHeight: 58,
  thumbSize: 40,
  contentMaxWidth: 640,
};

export const cameraColors = {
  surface: "#0F121A",
  overlay: "rgba(15, 18, 26, 0.72)",
  foreground: "#FFFFFF",
  corner: "rgba(255, 255, 255, 0.92)",
  scanLine: "#5271FF",
};
