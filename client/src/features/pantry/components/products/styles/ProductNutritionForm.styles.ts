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
        gap: spacing.sm,
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

      sectionHeaderRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        marginBottom: spacing.xs,
      },

      sectionTitle: {
        fontSize: 17,
        fontWeight: "900",
        color: colors.textPrimary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },

      sectionHint: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textMuted,
        marginBottom: spacing.sm,
        lineHeight: 18,
      },

      modeToggleRow: {
        flexDirection: "row",
        gap: spacing.xs,
      },

      modeBtn: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
      },

      modeBtnActive: {
        borderColor: colors.primaryGreenMid,
        backgroundColor: colors.primaryGreenLight,
      },

      modeBtnText: {
        fontSize: 11,
        fontWeight: "900",
        color: colors.textMuted,
      },

      modeBtnTextActive: {
        color: colors.primaryGreen,
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
