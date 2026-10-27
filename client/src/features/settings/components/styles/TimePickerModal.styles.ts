import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useTimePickerModalStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      pickerOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: colors.overlay,
      },

      pickerCard: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
      },

      pickerHeader: {
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
        marginBottom: spacing.sm,
      },

      pickerTitle: {
        ...typography.headline,
        color: colors.textPrimary,
      },

      pickerCancelText: {
        ...typography.body,
        color: colors.textSecondary,
      },

      pickerDoneText: {
        ...typography.bodyStrong,
        color: colors.accent,
      },
    }),
  );

export function getTimePickerModalDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
