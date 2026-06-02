import { Platform, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  heroCard: {
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
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 8,
      },
    }),
  },

  productMetaRow: {
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center",
  },

  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.cardBackgroundSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  metaChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  heroLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  nutritionGrid: {
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
