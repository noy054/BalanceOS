import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        backgroundColor: "transparent",
        gap: spacing.sm,
      },

      textGroup: {
        flex: 1,
        minWidth: 0,
      },

      title: {
        fontSize: 26,
        lineHeight: 32,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -0.5,
      },

      subtitle: {
        fontSize: 12,
        lineHeight: 17,
        fontWeight: "700",
        color: colors.textMuted,
        marginTop: 1,
      },

      backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },

    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
