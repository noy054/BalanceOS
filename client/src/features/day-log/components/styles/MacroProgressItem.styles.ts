import { StyleSheet } from "react-native";

import {
  homeDashboardColors,
  homeDashboardRadius,
  homeDashboardSpacing,
} from "../../constants/homeDashboardTheme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: homeDashboardSpacing.xs,
    paddingVertical: homeDashboardSpacing.sm,
  },

  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: homeDashboardRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: homeDashboardSpacing.sm,
  },

  label: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.62)",
    fontWeight: "800",
    marginBottom: 7,
    textAlign: "center",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 4,
  },

  current: {
    fontSize: 21,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },

  separator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.34)",
    fontWeight: "800",
  },

  targetValue: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.42)",
    fontWeight: "800",
  },

  unit: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.36)",
    marginTop: 2,
    marginBottom: homeDashboardSpacing.sm,
    fontWeight: "700",
  },

  progressTrack: {
    width: "86%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
