import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useBirthDatePickerModalStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: colors.overlay,
      },

      card: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
      },

      header: {
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
        marginBottom: spacing.sm,
      },

      action: {
        minWidth: 64,
        minHeight: 44,
        justifyContent: "center",
      },

      title: {
        ...typography.headline,
        color: colors.textPrimary,
        textAlign: "center",
      },

      cancelText: {
        ...typography.body,
        color: colors.textSecondary,
      },

      doneText: {
        ...typography.bodyStrong,
        color: colors.accent,
      },
    }),
  );

export function getBirthDatePickerDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
