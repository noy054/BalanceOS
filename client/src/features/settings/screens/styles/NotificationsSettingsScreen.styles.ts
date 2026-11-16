import { StyleSheet } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({

      scroll: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
      },

      intervalRow: {
        alignItems: "center",
        gap: spacing.ms,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm2,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },

      intervalLabel: {
        flex: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },

      intervalInput: {
        width: 80,
        minHeight: 40,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        paddingHorizontal: spacing.sm,
        ...typography.body,
        ...typography.number,
        color: colors.textPrimary,
        textAlign: "center",
      },

      weeklyOptions: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
        gap: spacing.ms,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },

      dayChips: {
        flexWrap: "wrap",
        gap: spacing.xs,
      },

      dayChip: {
        flexGrow: 1,
        flexBasis: 38,
        minHeight: 40,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        alignItems: "center",
        justifyContent: "center",
      },

      dayChipActive: {
        borderColor: colors.accentFill,
        backgroundColor: colors.accentFill,
      },

      dayChipText: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      dayChipTextActive: {
        fontFamily: fonts.medium,
        color: colors.onAccent,
      },

      weeklyTimeInputButton: {
        minHeight: 44,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        paddingHorizontal: spacing.ms,
        justifyContent: "center",
      },

      weeklyTimeInputText: {
        ...typography.body,
        ...typography.number,
        color: colors.textPrimary,
      },

      hint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      weeklyTimeInputPlaceholder: {
        color: colors.textMuted,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
    timeText: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: "ltr" as const,
    },
  };
}
