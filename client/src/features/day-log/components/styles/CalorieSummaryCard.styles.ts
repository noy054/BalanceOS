import { Platform, StyleSheet } from "react-native";

import {
  homeDashboardColors,
  homeDashboardRadius,
  homeDashboardSpacing,
} from "../../constants/homeDashboardTheme";

export const styles = StyleSheet.create({
  card: {
    minHeight: 278,
    borderRadius: homeDashboardRadius.xxl,
    paddingTop: homeDashboardSpacing.xl,
    paddingHorizontal: homeDashboardSpacing.xl,
    paddingBottom: homeDashboardSpacing.lg,
    overflow: "hidden",
    backgroundColor: "rgba(12, 16, 14, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.72)",
        shadowOpacity: 1,
        shadowRadius: 34,
        shadowOffset: { width: 0, height: 22 },
      },
      android: {
        elevation: 14,
      },
    }),
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(185, 255, 59, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(185, 255, 59, 0.24)",
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: homeDashboardColors.lime,
    letterSpacing: 0.2,
  },

  content: {
    alignItems: "center",
    gap: 3,
  },

  label: {
    fontSize: 15,
    color: "rgba(245, 255, 247, 0.68)",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.25,
  },

  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },

  remainingNumber: {
    fontSize: 92,
    fontWeight: "900",
    color: "#F7FFF8",
    lineHeight: 98,
    textAlign: "center",
    letterSpacing: -5.5,
  },

  unit: {
    fontSize: 15,
    fontWeight: "900",
    color: homeDashboardColors.lime,
    marginBottom: 19,
    letterSpacing: 0.2,
  },

  summary: {
    fontSize: 14,
    color: "rgba(245, 255, 247, 0.48)",
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },

  progressArea: {
    gap: 9,
  },

  progressTrack: {
    width: "100%",
    height: 13,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  progressFill: {
    height: "100%",
    backgroundColor: homeDashboardColors.lime,
    borderRadius: 999,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(245, 255, 247, 0.42)",
  },
});
