import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      group: {
        marginBottom: spacing.md,
      },

      label: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        letterSpacing: 0.1,
      },

      input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm2,
        fontSize: 15,
        color: colors.textPrimary,
        minHeight: 52,
      },

      inputError: {
        borderColor: colors.danger,
        borderWidth: 1.5,
      },

      inputDisabled: {
        opacity: 0.45,
      },

      inputRow: {
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        minHeight: 52,
      },

      inputRowError: {
        borderColor: colors.danger,
        borderWidth: 1.5,
      },

      inputRowDisabled: {
        opacity: 0.45,
      },

      inputInner: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm2,
        fontSize: 15,
        color: colors.textPrimary,
      },

      toggleBtn: {
        paddingHorizontal: spacing.sm,
        alignSelf: "stretch",
        alignItems: "center",
        justifyContent: "center",
      },

      inputMultiline: {
        minHeight: 84,
        paddingTop: spacing.sm,
        textAlignVertical: "top",
      },

      error: {
        fontSize: 12,
        color: colors.danger,
        marginTop: spacing.xs,
        fontWeight: "600",
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
