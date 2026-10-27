import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
      },

      appCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        alignItems: "center",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        marginBottom: spacing.lg,
        gap: spacing.sm,
      },

      logoMark: {
        alignItems: "baseline",
        justifyContent: "center",
      },

      logoBalance: {
        fontSize: 26,
        fontWeight: "700",
        color: colors.textPrimary,
        letterSpacing: -0.5,
      },

      logoOS: {
        fontSize: 26,
        fontWeight: "700",
        color: colors.accent,
        letterSpacing: -0.5,
      },

      tagline: {
        ...typography.callout,
        color: colors.textSecondary,
        textAlign: "center",
      },

      versionBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.xs,
        backgroundColor: colors.surfaceMuted,
      },

      versionText: {
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
      },

      footerText: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
        paddingHorizontal: spacing.xs,
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
      flexDirection: "row" as const,
    },
  };
}
