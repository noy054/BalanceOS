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
        borderBottomColor: colors.border,
      },

      timeInputButton: {
        minHeight: 44,
        marginHorizontal: spacing.md,
        marginBottom: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
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
