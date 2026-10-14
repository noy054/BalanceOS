import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      ingredientRow: {
        alignItems: "center",
        backgroundColor: colors.cardBackgroundStrong,
        borderRadius: radius.lg,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
      },

      ingredientInfo: {
        flex: 1,
        minWidth: 0,
      },

      ingredientName: {
        fontSize: 14,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      ingredientBrand: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.textMuted,
        marginTop: 2,
      },

      ingredientServing: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.primaryGreen,
        marginTop: 2,
      },

      gramsBox: {
        alignItems: "center",
        gap: spacing.xs,
      },

      gramsInput: {
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

      gramsLabel: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.textMuted,
      },

      unitToggle: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.cardBackgroundSoft,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
      },

      unitToggleActive: {
        borderColor: colors.primaryGreenMid,
        backgroundColor: colors.primaryGreenLight,
      },

      unitTogglePressed: {
        opacity: 0.7,
      },

      unitToggleText: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.textMuted,
      },

      unitToggleTextActive: {
        color: colors.primaryGreen,
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
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },

    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
