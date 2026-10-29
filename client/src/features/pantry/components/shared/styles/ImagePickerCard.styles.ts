import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },

      imageButton: {
        width: 72,
        height: 72,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },

      image: {
        width: "100%",
        height: "100%",
      },

      pressed: {
        opacity: 0.7,
      },

      textWrap: {
        flex: 1,
        gap: spacing.xs,
      },

      title: {
        ...typography.callout,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      actionsRow: {
        flexWrap: "wrap",
        gap: spacing.sm,
        marginTop: spacing.xs,
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
