import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      heroRow: {
        alignItems: "stretch",
        gap: spacing.md,
      },

      heroCell: {
        flex: 1,
        gap: 2,
      },

      heroDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
      },

      heroLabel: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      heroValueRow: {
        alignItems: "baseline",
        gap: spacing.xs,
      },

      heroValue: {
        ...typography.display,
        fontSize: 30,
        lineHeight: 36,
        color: colors.textPrimary,
      },

      heroUnit: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      heroSub: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },

      statsRow: {
        marginTop: spacing.md,
        gap: spacing.sm,
      },

      statCell: {
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm2,
        paddingVertical: spacing.sm2,
        gap: 2,
      },

      statValue: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
      },

      statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      statSub: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        fontWeight: "400",
        color: colors.textMuted,
      },

      gapList: {
        marginTop: spacing.ms,
      },

      gapRow: {
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.sm2,
      },

      gapRowBorder: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },

      gapText: {
        flex: 1,
        gap: 1,
      },

      gapLabel: {
        ...typography.callout,
        color: colors.textPrimary,
      },

      gapSub: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },

      gapValue: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
      },

      valueGood: {
        color: colors.success,
      },

      valueAttention: {
        color: colors.warning,
      },
    }),
  );
