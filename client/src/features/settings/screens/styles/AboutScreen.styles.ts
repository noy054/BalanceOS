import { StyleSheet } from "react-native";

import {
  spacing,
  radius,
  cardShadow,
  useThemedStyles,
} from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      content: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },

      appCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        ...cardShadow,
      },

      logoMark: {
        alignItems: "baseline",
        justifyContent: "center",
        marginBottom: spacing.sm,
      },

      logoBalance: {
        fontSize: 30,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -0.7,
      },

      logoOS: {
        fontSize: 30,
        fontWeight: "900",
        color: colors.primaryGreen,
        letterSpacing: -0.7,
      },

      tagline: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "700",
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.md,
      },

      versionBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 999,
        backgroundColor: colors.primaryGreenLight,
        borderWidth: 1,
        borderColor: colors.primaryGreenMid,
      },

      versionText: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.primaryGreen,
      },

      footerText: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "600",
        color: colors.textMuted,
        textAlign: "center",
        paddingHorizontal: spacing.md,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },

    logoRow: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
  };
}
