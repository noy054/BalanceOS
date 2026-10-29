import { StyleSheet } from "react-native";

import { fonts, radius, spacing, states, typography, useThemedStyles } from "../../theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      group: {
        marginBottom: spacing.md,
      },

      label: {
        ...typography.label,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs + 2,
      },

      frame: {
        borderRadius: radius.md,
        alignItems: "center",
        minHeight: 48,
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.borderStrong,
      },

      frameFocused: {
        borderColor: colors.accent,
        backgroundColor: colors.surface,
      },

      frameError: {
        borderColor: colors.danger,
      },

      frameDisabled: {
        opacity: states.disabledOpacity,
      },

      input: {
        flex: 1,
        alignSelf: "stretch",
        paddingHorizontal: spacing.ms,
        paddingVertical: spacing.sm2,
        ...typography.body,
        color: colors.textPrimary,
      },

      inputMultiline: {
        minHeight: 88,
        paddingTop: spacing.sm2,
        textAlignVertical: "top",
      },

      toggleBtn: {
        paddingHorizontal: spacing.ms,
        alignSelf: "stretch",
        alignItems: "center",
        justifyContent: "center",
      },

      messageRow: {
        alignItems: "center",
        gap: spacing.xs,
        marginTop: spacing.xs + 2,
      },

      error: {
        flexShrink: 1,
        ...typography.caption,
        color: colors.danger,
      },

      hint: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: spacing.xs + 2,
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

    input: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
