import { StyleSheet } from "react-native";

import { spacing, useThemedStyles } from "../../../../shared/theme";

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

      headerActions: {
        alignItems: "center",
        gap: spacing.xs,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },
    }),
  );
