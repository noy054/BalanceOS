import { StyleSheet } from "react-native";

import { fonts, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      rangeMeta: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: 2,
        marginBottom: spacing.xs,
      },

      row: {
        marginTop: spacing.ms,
        gap: spacing.xs + 2,
      },

      rowHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      rowHeaderRtl: {
        flexDirection: "row-reverse",
      },

      macroName: {
        ...typography.callout,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      macroNumbers: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      macroTarget: {
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },

      track: {
        height: 6,
        borderRadius: 4,
        backgroundColor: colors.progressTrack,
        overflow: "hidden",
      },

      fill: {
        height: "100%",
        borderRadius: 4,
      },

      pctLabel: {
        ...typography.caption,
        ...typography.number,
      },
    }),
  );
