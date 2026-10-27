import { StyleSheet } from "react-native";

import {
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.sm,
      },

      label: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      caloriesRow: {
        alignItems: "baseline",
        gap: spacing.xs + 2,
      },

      caloriesValue: {
        ...typography.display,
        fontSize: 30,
        lineHeight: 36,
        color: colors.textPrimary,
      },

      caloriesUnit: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      macrosRow: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingTop: spacing.ms,
        gap: spacing.sm,
      },

      macroCell: {
        flex: 1,
        gap: 2,
        alignItems: "center",
      },

      macroValue: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
        textAlign: "center",
      },

      macroUnit: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },

      macroLabel: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textSecondary,
        textAlign: "center",
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
