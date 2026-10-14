import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useBirthDatePickerModalStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.62)",
      },

      card: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: radius.xl,
        overflow: "hidden",
        backgroundColor: colors.cardBackgroundStrong,
        borderWidth: 1,
        borderColor: colors.border,
      },

      header: {
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      action: {
        minWidth: 58,
      },

      title: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      cancelText: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.textSecondary,
      },

      doneText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.primaryGreen,
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
