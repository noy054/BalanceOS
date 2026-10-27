import { StyleSheet } from "react-native";

import { spacing, typography, useThemedStyles } from "../../../../../shared/theme";

export const useRowStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
        paddingVertical: spacing.sm,
        gap: spacing.md,
      },

      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },

      label: {
        flex: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },

      labelHighlight: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },

      valueRow: {
        alignItems: "baseline",
        gap: spacing.xs,
      },

      value: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
        writingDirection: "ltr",
      },

      valueHighlight: {
        ...typography.headline,
        ...typography.number,
      },

      unit: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },
    }),
  );
