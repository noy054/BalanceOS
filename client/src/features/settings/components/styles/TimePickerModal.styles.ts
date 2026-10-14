import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useTimePickerModalStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      pickerOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.62)",
      },

      pickerCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: radius.xl,
        overflow: "hidden",
        backgroundColor: colors.cardBackgroundStrong,
        borderWidth: 1,
        borderColor: colors.border,
      },

      pickerHeader: {
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },

      pickerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "900",
        color: colors.textPrimary,
      },

      pickerCancelText: {
        minWidth: 58,
        fontSize: 15,
        fontWeight: "800",
        color: colors.textSecondary,
      },

      pickerDoneText: {
        minWidth: 58,
        fontSize: 15,
        fontWeight: "900",
        color: colors.primaryGreen,
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
