import { StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      keyboardView: {
        flex: 1,
      },

      scroll: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl + 140,
        gap: spacing.lg,
      },

      formCard: {
        paddingHorizontal: 28,
        paddingTop: 24,
        paddingBottom: 28,
        gap: 22,
      },

      inputGroup: {
        width: "100%",
      },

      autoNote: {
        backgroundColor: colors.primaryGreenLight,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
      },

      autoNoteText: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "700",
      },

      saveBtn: {
        backgroundColor: colors.buttonPrimaryBackground,
        borderRadius: radius.xl,
        minHeight: 58,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
      },

      saveBtnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.985 }],
      },

      saveBtnDisabled: {
        backgroundColor: colors.buttonPrimaryDisabledBackground,
        borderWidth: 1,
        borderColor: colors.buttonPrimaryDisabledBorder,
        opacity: 1,
      },

      saveBtnText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.buttonPrimaryText,
        letterSpacing: 0.2,
      },

      saveBtnTextDisabled: {
        color: colors.buttonPrimaryDisabledText,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
