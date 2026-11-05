import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      modeRow: {
        marginBottom: spacing.md,
      },

      modeTrack: {
        padding: 4,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },

      tiles: {
        gap: spacing.sm,
      },

      grid: {
        gap: spacing.sm,
      },

      servingFirst: {
        marginBottom: spacing.xs,
      },

      scaledNote: {
        ...typography.footnote,
        marginTop: spacing.sm,
        color: colors.accent,
      },

      servingLast: {
        marginTop: spacing.lg,
      },
    }),
  );
