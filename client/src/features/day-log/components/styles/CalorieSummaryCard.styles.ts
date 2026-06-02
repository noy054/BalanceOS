import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  card: {
    minHeight: 278,
    borderRadius: radius.xxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    overflow: "hidden",
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
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
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.primaryGreen,
    letterSpacing: 0.2,
  },

  content: {
    alignItems: "center",
    gap: 3,
  },

  label: {
    fontSize: 15,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    lineHeight: 98,
    textAlign: "center",
    letterSpacing: -5.5,
  },

  unit: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primaryGreen,
    marginBottom: 19,
    letterSpacing: 0.2,
  },

  summary: {
    fontSize: 14,
    color: colors.textMuted,
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
    backgroundColor: colors.progressTrack,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primaryGreen,
    borderRadius: 999,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
  },
});
