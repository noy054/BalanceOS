import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: spacing.md,
      },

      caloriesBlock: {
        gap: spacing.xxs,
      },

      label: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      caloriesRow: {
        alignItems: "baseline",
        gap: spacing.xs + 2,
      },

      caloriesValue: {
        ...typography.display,
        fontSize: 34,
        lineHeight: 40,
        color: colors.textPrimary,
      },

      caloriesUnit: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      macrosRow: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
        gap: spacing.sm,
      },

      macroCell: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs,
      },

      macrosGrid: {
        flexWrap: "wrap",
        rowGap: spacing.md,
      },

      macroCellHalf: {
        flexBasis: "45%",
      },

      macroHead: {
        alignItems: "center",
        gap: spacing.xs + 2,
      },

      macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
      },

      macroLabel: {
        ...typography.caption,
        flexShrink: 1,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },

      macroValue: {
        ...typography.value,
        fontSize: 18,
        lineHeight: 24,
      },

      macroUnit: {
        ...typography.caption,
        fontFamily: fonts.regular,
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
  };
}
