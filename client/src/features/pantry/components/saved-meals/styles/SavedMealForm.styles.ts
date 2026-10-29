import { Platform, StyleSheet } from "react-native";

import { fonts, spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      formCard: {
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        gap: spacing.md,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
          },
          android: {
            elevation: 6,
          },
        }),
      },

      fieldGroup: {
        gap: spacing.xs,
      },

      fieldLabel: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: colors.textSecondary,
      },

      input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm2,
        fontSize: 15,
        fontFamily: fonts.bold,
        color: colors.textPrimary,
        minHeight: 50,
      },

      inputError: {
        borderColor: colors.danger,
      },

      errorText: {
        fontSize: 12,
        fontFamily: fonts.bold,
        color: colors.danger,
        marginTop: spacing.xs,
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
