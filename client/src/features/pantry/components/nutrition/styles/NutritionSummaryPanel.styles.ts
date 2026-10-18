import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      panel: {
        borderRadius: radius.lg,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm2,
        paddingVertical: spacing.sm2,
        gap: spacing.sm2,
      },

      caloriesRow: {
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      caloriesLabel: {
        flexShrink: 1,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "700",
        color: colors.textSecondary,
      },

      caloriesValue: {
        flexShrink: 0,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: "900",
        color: colors.primaryGreen,
        fontVariant: ["tabular-nums"],
      },

      caloriesUnit: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textSecondary,
      },

      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
      },

      macrosRow: {
        gap: spacing.sm,
      },

      macroCell: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: 2,
      },

      macroLabel: {
        fontSize: 11,
        lineHeight: 15,
        fontWeight: "700",
        color: colors.textMuted,
        textAlign: "center",
      },

      macroValue: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "900",
        color: colors.textPrimary,
        textAlign: "center",
        fontVariant: ["tabular-nums"],
      },

      macroUnit: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.textMuted,
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

    writing: {
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
