import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      addButtonsRow: {
        gap: spacing.sm,
      },

      addItemBtn: {
        flex: 1,
        minHeight: 52,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        borderRadius: radius.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: spacing.xs,
        borderStyle: "dashed",
        backgroundColor: colors.cardBackgroundSoft,
      },

      addItemBtnPressed: {
        opacity: 0.78,
        transform: [{ scale: 0.985 }],
      },

      addItemText: {
        fontSize: 13,
        fontWeight: "900",
        color: colors.textSecondary,
        textAlign: "center",
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
