import { StyleSheet } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      content: {
        gap: spacing.md,
      },

      section: {
        gap: spacing.sm,
      },

      subTitle: {
        ...typography.label,
        color: colors.textSecondary,
      },

      list: {
        gap: 0,
      },

      foodRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 48,
        paddingVertical: spacing.xs + 2,
      },

      foodRowRtl: {
        flexDirection: "row-reverse",
      },

      rankBadge: {
        width: 26,
        height: 26,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
      },

      rankText: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
      },

      foodTextBlock: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },

      foodName: {
        ...typography.callout,
        color: colors.textPrimary,
      },

      foodMeta: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },

      foodStat: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
      },

      emptyBox: {
        paddingVertical: spacing.sm,
      },

      emptyText: {
        ...typography.footnote,
        color: colors.textMuted,
      },
    }),
  );
