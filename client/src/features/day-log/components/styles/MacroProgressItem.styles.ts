import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },

  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: spacing.sm,
  },

  label: {
    fontSize: 11,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },

  separator: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "800",
  },

  targetValue: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "800",
  },

  unit: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },

  progressTrack: {
    width: "86%",
    height: 6,
    backgroundColor: colors.progressTrack,
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
