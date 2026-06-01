import { Platform, StyleSheet } from "react-native";

import {
  homeDashboardColors,
  homeDashboardRadius,
  homeDashboardSpacing,
} from "../../../day-log/constants/homeDashboardTheme";

export const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    backgroundColor: "rgba(13, 18, 16, 0.96)",
    borderRadius: homeDashboardRadius.xl,
    paddingVertical: homeDashboardSpacing.md,
    paddingHorizontal: homeDashboardSpacing.lg,
    borderWidth: 1.5,
    borderColor: "rgba(185, 255, 59, 0.42)",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(185, 255, 59, 0.18)",
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 7,
      },
    }),
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(185, 255, 59, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(185, 255, 59, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconRTL: {
    marginStart: homeDashboardSpacing.md,
  },

  iconLTR: {
    marginEnd: homeDashboardSpacing.md,
  },

  label: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.1,
    textAlign: "center",
  },
});
