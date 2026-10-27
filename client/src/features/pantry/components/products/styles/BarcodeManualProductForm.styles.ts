import { StyleSheet } from "react-native";

import {
  radius,
  spacing,
  typography,
  useThemedStyles,
} from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
      },

      form: {
        gap: spacing.lg,
        paddingBottom: spacing.lg,
      },

      header: {
        gap: spacing.sm,
      },

      headerTitle: {
        ...typography.headline,
        color: colors.textPrimary,
      },

      barcodeChip: {
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      },

      barcodeText: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },

      grid: {
        gap: spacing.ms,
      },

      gridCell: {
        flex: 1,
      },

      actions: {
        gap: spacing.xs,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
      },
    }),
  );
