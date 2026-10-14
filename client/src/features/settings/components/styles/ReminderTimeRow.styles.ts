import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useReminderTimeRowStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      reminderRow: {
        paddingBottom: spacing.xs,
      },

      reminderRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.xs,
      },

      timeInputButton: {
        minHeight: 48,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
      },

      timeInputText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.textPrimary,
        writingDirection: "ltr",
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
