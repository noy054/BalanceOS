import { StyleSheet } from "react-native";

import { fonts, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      flex: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
      },

      formCard: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },

      readonlyGroup: {
        marginBottom: spacing.md,
        gap: 2,
      },

      readonlyLabel: {
        ...typography.label,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      },

      emailValue: {
        ...typography.body,
        color: colors.textPrimary,
      },

      emailNote: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },

      dateInputPressed: {
        opacity: 0.7,
      },

      grid: {
        gap: spacing.ms,
      },

      gridCell: {
        flex: 1,
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
