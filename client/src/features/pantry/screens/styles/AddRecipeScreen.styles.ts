import { Platform, StyleSheet } from "react-native";

import { spacing, radius, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
      },

      loadingText: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.textMuted,
        textAlign: "center",
      },

      scroll: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl,
        gap: spacing.lg,
      },

      footer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
      },

      introCard: {
        borderRadius: radius.xl,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOpacity: 0.75,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
          },
          android: {
            elevation: 4,
          },
        }),
      },

      subtitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textSecondary,
        lineHeight: 20,
      },

      totalsContainer: {
        borderRadius: radius.xl,
        overflow: "hidden",
      },

      saveBtn: {
        backgroundColor: colors.primaryGreen,
        borderRadius: radius.xl,
        minHeight: 58,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.xs,
        ...Platform.select({
          ios: {
            shadowColor: colors.primaryGreen,
            shadowOpacity: 0.22,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
          },
          android: {
            elevation: 7,
          },
        }),
      },

      saveBtnPressed: {
        opacity: 0.84,
        transform: [{ scale: 0.985 }],
      },

      saveBtnDisabled: {
        opacity: 0.55,
      },

      saveBtnText: {
        fontSize: 15,
        fontWeight: "900",
        color: colors.background,
        letterSpacing: 0.2,
        textAlign: "center",
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
