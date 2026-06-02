import { Platform, StyleSheet } from "react-native";

import { colors, spacing, radius } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },

  introCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    lineHeight: 20,
  },

  formCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  fieldGroup: {
    gap: spacing.xs,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    minHeight: 50,
  },

  inputError: {
    borderColor: colors.danger,
  },

  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
    marginTop: spacing.xs,
  },

  mealTypeRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },

  mealTypeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.inputBackground,
  },

  mealTypeChipActive: {
    borderColor: colors.primaryGreenMid,
    backgroundColor: colors.primaryGreenLight,
  },

  chipPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },

  mealTypeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
  },

  mealTypeTextActive: {
    color: colors.primaryGreen,
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textPrimary,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  itemRow: {
    alignItems: "center",
    backgroundColor: colors.cardBackgroundStrong,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  itemKind: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 2,
  },

  amountBox: {
    alignItems: "center",
    gap: spacing.xs,
  },

  amountInput: {
    width: 72,
    height: 38,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
    paddingHorizontal: spacing.xs,
  },

  unitLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
  },

  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackgroundSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  removeBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },

  addButtonsRow: {
    gap: spacing.sm,
  },

  addItemBtn: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    borderStyle: "dashed",
    backgroundColor: colors.cardBackgroundSoft,
  },

  addItemBtnPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  addItemText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textSecondary,
    textAlign: "center",
  },

  totalsContainer: {
    borderRadius: radius.xl,
    overflow: "hidden",
  },

  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xl,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOpacity: 0.22,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 7,
      },
    }),
  },

  saveBtnPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  saveBtnDisabled: {
    opacity: 0.55,
  },

  saveBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.background,
    letterSpacing: 0.2,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
