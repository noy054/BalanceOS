import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

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
        backgroundColor: colors.canvas,
      },

      scroll: {
        flex: 1,
      },

      headerActions: {
        alignItems: "center",
        gap: spacing.xs,
      },
      contextBanner: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        backgroundColor: colors.accentSoft,
      },
      contextText: {
        flex: 1,
        ...typography.callout,
        color: colors.textPrimary,
      },
      ingredientAction: {
        gap: spacing.sm,
      },
      ingredientHint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },
    }),
  );
