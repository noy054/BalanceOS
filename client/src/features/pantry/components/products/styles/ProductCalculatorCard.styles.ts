import { StyleSheet } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        gap: spacing.md,
      },

      toggle: {
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: radius.round,
        padding: 4,
      },

      stepper: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingTop: spacing.xs,
      },

      quantityBlock: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
      },

      quantityInput: {
        alignSelf: "stretch",
        ...typography.number,
        fontFamily: fonts.semibold,
        fontSize: 48,
        lineHeight: 56,
        minHeight: 56,
        paddingVertical: 0,
        textAlign: "center",
        color: colors.textPrimary,
      },

      quantityUnit: {
        ...typography.callout,
        textAlign: "center",
        color: colors.textSecondary,
      },

      equivalents: {
        ...typography.footnote,
        ...typography.number,
        textAlign: "center",
        color: colors.accent,
      },

      hint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      resultCard: {
        gap: spacing.ms,
        borderRadius: radius.lg,
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.md,
      },

      resultHeader: {
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.sm,
      },

      resultTitle: {
        ...typography.headline,
        flexShrink: 1,
        color: colors.textPrimary,
      },


      columns: {
        gap: spacing.xs,
      },

      column: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: 2,
      },

      columnValue: {
        ...typography.value,
        fontFamily: fonts.semibold,
        fontSize: 18,
        color: colors.textPrimary,
      },

      columnLabel: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
    }),
  );
