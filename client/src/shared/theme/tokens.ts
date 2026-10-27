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
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

const tabularNums: TextStyle["fontVariant"] = ["tabular-nums"];

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.6,
    fontVariant: tabularNums,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  callout: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  number: {
    fontVariant: tabularNums,
  },
} satisfies Record<string, TextStyle>;

export const shadows = {
  sm: {
    shadowColor: "#1F2328",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#1F2328",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#1F2328",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
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
  headerHeight: 56,
  tabBarHeight: 58,
  thumbSize: 48,
};

export const cameraColors = {
  surface: "#111317",
  overlay: "rgba(17, 19, 23, 0.72)",
  foreground: "#FFFFFF",
  corner: "rgba(255, 255, 255, 0.92)",
  scanLine: "#84A5DF",
};
