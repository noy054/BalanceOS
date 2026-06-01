import { Platform, StyleSheet } from "react-native";

import {
  homeDashboardColors,
  homeDashboardRadius,
  homeDashboardSpacing,
} from "../../constants/homeDashboardTheme";

export const styles = StyleSheet.create({
  card: {
    borderRadius: homeDashboardRadius.xl,
    backgroundColor: "rgba(13, 18, 16, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.55)",
        shadowOpacity: 1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 9,
      },
    }),
  },

  content: {
    alignItems: "stretch",
    paddingVertical: homeDashboardSpacing.md,
    paddingHorizontal: homeDashboardSpacing.sm,
  },

  divider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    marginVertical: homeDashboardSpacing.sm,
  },
});
