import { StyleSheet } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

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

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
      },

      saveSuccessBanner: {
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: colors.successSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
        paddingVertical: spacing.sm,
      },

      saveSuccessText: {
        flex: 1,
        ...typography.footnote,
        fontFamily: fonts.semibold,
        color: colors.success,
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
