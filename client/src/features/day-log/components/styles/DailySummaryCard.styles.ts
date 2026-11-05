import { StyleSheet } from "react-native";

import {
  fonts,
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../shared/theme";
import { withAlpha } from "../../../../shared/helpers/progressColor";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        gap: spacing.lg,
      },

      hero: {
        alignItems: "center",
        gap: spacing.xs,
        paddingTop: spacing.sm,
      },

      mainLabel: {
        ...typography.callout,
        textAlign: "center",
        color: colors.textSecondary,
      },

      mainNumber: {
        ...typography.display,
        fontFamily: fonts.bold,
        fontSize: 56,
        lineHeight: 64,
        letterSpacing: -1,
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
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        backgroundImage: `linear-gradient(180deg, ${withAlpha(
          colors.gloss,
          0.09,
        )} 0%, ${withAlpha(colors.gloss, 0)} 55%)`,
      },

      macroLabel: {
        ...typography.bodyStrong,
        fontFamily: fonts.semibold,
        textAlign: "center",
        color: colors.textPrimary,
      },

      macroValue: {
        ...typography.value,
        fontFamily: fonts.bold,
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
        fontSize: 18,
        lineHeight: 22,
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
