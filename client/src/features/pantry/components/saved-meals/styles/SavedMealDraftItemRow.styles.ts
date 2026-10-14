import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      itemRow: {
        alignItems: "center",
        backgroundColor: colors.cardBackgroundStrong,
        borderRadius: radius.lg,
        paddingVertical: spacing.sm2,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
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
        fontSize: 12,
        fontWeight: "600",
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
