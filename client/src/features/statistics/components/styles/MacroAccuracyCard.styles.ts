import { StyleSheet } from "react-native";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      rangeMeta: {
        ...typography.caption,
        fontWeight: "400",
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
        fontWeight: "600",
        color: colors.textPrimary,
      },

      macroNumbers: {
        ...typography.callout,
        ...typography.number,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      macroTarget: {
        fontWeight: "400",
        color: colors.textMuted,
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
      },

      pctLabel: {
        ...typography.caption,
        ...typography.number,
      },
    }),
  );
