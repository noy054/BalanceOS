import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useReminderTimeRowStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      reminderRow: {
        paddingBottom: 0,
      },

      reminderRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },

      timeInputButton: {
        minHeight: 44,
        marginHorizontal: spacing.md,
        marginBottom: spacing.ms,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        paddingHorizontal: spacing.ms,
        justifyContent: "center",
      },

      timeInputText: {
        ...typography.body,
        ...typography.number,
        color: colors.textPrimary,
      },

      timeInputPlaceholder: {
        color: colors.textMuted,
      },
    }),
  );

export function getReminderTimeRowDirectionStyles(isRTL: boolean) {
  return {
    timeText: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    },
  };
}
