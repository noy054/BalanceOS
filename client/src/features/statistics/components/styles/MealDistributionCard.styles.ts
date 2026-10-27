import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      list: {
        gap: spacing.ms,
      },

      row: {
        gap: spacing.xs + 2,
      },

      topLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.ms,
      },

      topLineRtl: {
        flexDirection: "row-reverse",
      },

      textBlock: {
        flex: 1,
        gap: 1,
      },

      mealName: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      mealSubText: {
        ...typography.caption,
        ...typography.number,
        fontWeight: "400",
        color: colors.textSecondary,
      },

      percentBadge: {
        minWidth: 48,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
        backgroundColor: colors.accentSoft,
        alignItems: "center",
      },

      percentText: {
        ...typography.label,
        ...typography.number,
        color: colors.accent,
      },

      track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.progressTrack,
        overflow: "hidden",
      },

      fill: {
        height: "100%",
        borderRadius: 3,
        backgroundColor: colors.accent,
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
