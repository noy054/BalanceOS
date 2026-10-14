import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      formCard: {
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
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

      sectionTitle: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.textPrimary,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },

      addIngredientBtn: {
        minHeight: 52,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        borderRadius: radius.lg,
        paddingVertical: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "dashed",
        backgroundColor: colors.cardBackgroundSoft,
      },

      addIngredientBtnPressed: {
        opacity: 0.78,
        transform: [{ scale: 0.985 }],
      },

      addIngredientText: {
        fontSize: 14,
        fontWeight: "900",
        color: colors.textSecondary,
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
