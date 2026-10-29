import { StyleSheet } from "react-native";

import {
  fonts,
  spacing,
  typography,
  useThemedStyles, radius } from "../../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      calculatorCard: {
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
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
        borderRadius: radius.md,
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 48,
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        paddingHorizontal: spacing.ms,
      },

      calcInput: {
        flex: 1,
        minWidth: 0,
        minHeight: 46,
        ...typography.value,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },

      calcUnit: {
        ...typography.callout,
        color: colors.textSecondary,
        maxWidth: 140,
      },

      calcResultCard: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.ms,
      },

      calcResultTitle: {
        ...typography.overline,
        color: colors.textSecondary,
        marginBottom: spacing.xxs,
      },

      quantityText: {
        ...typography.bodyStrong,
        ...typography.number,
        fontFamily: fonts.semibold,
        fontSize: 17,
        lineHeight: 24,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
      },
    }),
  );
