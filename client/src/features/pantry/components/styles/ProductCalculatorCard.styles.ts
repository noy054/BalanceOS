import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  calculatorCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
      },
      android: {
        elevation: 7,
      },
    }),
  },

  sectionHeaderRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  sectionHint: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  calculatorIconBubble: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  calcRow: {
    alignItems: "center",
    gap: spacing.sm,
  },

  calcInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
    fontWeight: "700",
  },

  calcBtn: {
    width: 52,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOpacity: 0.24,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  calcBtnPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.97 }],
  },
  headerBlock: {
    gap: 4,
  },

  calcResultCard: {
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.cardBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },

  calcResultTitle: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 14,
    fontWeight: "900",
    color: colors.primaryGreen,
  },
});
