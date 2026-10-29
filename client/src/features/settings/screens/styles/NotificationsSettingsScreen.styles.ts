import { StyleSheet } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

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
        borderTopColor: colors.border,
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
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
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
        borderTopColor: colors.border,
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
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
      },

      dayChipActive: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },

      dayChipText: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      dayChipTextActive: {
        fontFamily: fonts.semibold,
        color: colors.accent,
      },

      weeklyTimeInputButton: {
        minHeight: 44,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        paddingHorizontal: spacing.ms,
        justifyContent: "center",
      },

      weeklyTimeInputText: {
        ...typography.body,
        ...typography.number,
        color: colors.textPrimary,
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
