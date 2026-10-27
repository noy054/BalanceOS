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
      calculatorCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.ms,
      },

      plain: {
        gap: spacing.ms,
      },

      headerBlock: {
        gap: spacing.xxs,
      },

      sectionTitle: {
        ...typography.headline,
        color: colors.textPrimary,
      },

      sectionHint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      calcRow: {
        alignItems: "center",
        gap: spacing.sm,
      },

      calcInput: {
        flex: 1,
        minHeight: 48,
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
        ...typography.body,
        color: colors.textPrimary,
      },

      calcResultCard: {
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        paddingHorizontal: spacing.ms,
        paddingTop: spacing.ms,
        paddingBottom: spacing.xs,
      },

      calcResultTitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      },
    }),
  );
