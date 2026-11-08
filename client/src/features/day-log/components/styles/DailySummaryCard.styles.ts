import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";
import { withAlpha } from "../../../../shared/helpers/progressColor";

export function macroCardStyle(color: string, dark: boolean, gloss: string) {
  return {
    backgroundColor: dark ? withAlpha(color, 0.05) : withAlpha(color, 0.07),
    backgroundImage: `linear-gradient(180deg, ${withAlpha(gloss, dark ? 0.08 : 0.5)} 0%, ${withAlpha(
      color,
      0.04,
    )} 45%, ${withAlpha(color, dark ? 0.24 : 0.16)} 100%)`,
    borderColor: withAlpha(color, dark ? 0.3 : 0.26),
    borderTopColor: withAlpha(gloss, dark ? 0.16 : 0.9),
    borderBottomColor: withAlpha(color, dark ? 0.85 : 0.55),
    boxShadow: `0 8px 18px -8px ${withAlpha(color, dark ? 0.7 : 0.35)}`,
  };
}

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        gap: spacing.lg,
      },

      hero: {
        alignItems: "center",
        paddingVertical: spacing.xs,
      },

      mainLabel: {
        ...typography.callout,
        textAlign: "center",
        color: colors.textSecondary,
      },

      mainNumber: {
        ...typography.display,
        ...typography.number,
        fontFamily: fonts.bold,
        fontSize: 72,
        lineHeight: 78,
        letterSpacing: -1.5,
        maxWidth: "100%",
        textAlign: "center",
        color: colors.textPrimary,
      },

      mainTarget: {
        ...typography.callout,
        ...typography.number,
        textAlign: "center",
        color: colors.textSecondary,
      },

      macros: {
        flexWrap: "wrap",
        gap: spacing.sm,
      },

      macroCard: {
        flexGrow: 1,
        flexBasis: 64,
        minWidth: 64,
        alignItems: "center",
        gap: spacing.xs,
        paddingTop: spacing.md,
        paddingBottom: spacing.ms,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.lg,
        borderWidth: 1,
      },

      macroLabel: {
        ...typography.bodyStrong,
        fontFamily: fonts.semibold,
        textAlign: "center",
        color: colors.textPrimary,
      },

      macroLabelCompact: {
        fontSize: 13,
        lineHeight: 18,
      },

      macroValue: {
        ...typography.value,
        fontFamily: fonts.bold,
        fontSize: 20,
        lineHeight: 26,
      },

      macroAmount: {
        alignItems: "center",
      },

      macroTrack: {
        alignSelf: "stretch",
        height: 6,
        marginTop: spacing.xxs,
        marginHorizontal: spacing.xs,
        borderRadius: radius.round,
        overflow: "hidden",
      },

      macroFill: {
        height: "100%",
        borderRadius: radius.round,
      },

      badgeValue: {
        ...typography.bodyStrong,
        ...typography.number,
        fontFamily: fonts.bold,
        fontSize: 20,
        lineHeight: 24,
        color: colors.textPrimary,
      },

      badgeLabel: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        color: colors.textSecondary,
      },

      macroTarget: {
        ...typography.footnote,
        ...typography.number,
        textAlign: "center",
        color: colors.textSecondary,
      },
    }),
  );
