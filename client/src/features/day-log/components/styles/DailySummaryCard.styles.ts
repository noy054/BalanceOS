import { StyleSheet } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        gap: spacing.lg,
      },

      hero: {
        alignItems: "center",
        gap: spacing.md,
        paddingTop: spacing.sm,
      },

      mainNumber: {
        ...typography.display,
        fontSize: 44,
        lineHeight: 52,
        maxWidth: "76%",
        textAlign: "center",
        color: colors.textPrimary,
      },

      mainLabel: {
        ...typography.callout,
        maxWidth: "70%",
        textAlign: "center",
        color: colors.textSecondary,
      },

      mainUnit: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },

      macros: {
        gap: spacing.md,
      },

      macroHead: {
        alignItems: "baseline",
        gap: spacing.sm,
        marginBottom: spacing.xs + 2,
      },

      macroLabel: {
        ...typography.bodyStrong,
        flex: 1,
        color: colors.textPrimary,
      },

      macroValue: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      macroTarget: {
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
    }),
  );
