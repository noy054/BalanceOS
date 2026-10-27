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
      container: {
        gap: spacing.lg,
      },

      identityRow: {
        alignItems: "center",
        gap: spacing.ms,
      },

      identityText: {
        flex: 1,
        gap: spacing.xs,
      },

      productName: {
        ...typography.title,
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
      },

      productBrand: {
        ...typography.callout,
        color: colors.textSecondary,
      },

      offBanner: {
        alignItems: "flex-start",
        gap: spacing.sm,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
        paddingVertical: spacing.sm2,
      },

      offBannerText: {
        flex: 1,
        ...typography.footnote,
        color: colors.textSecondary,
      },

      nutritionCard: {
        paddingTop: spacing.xs,
        paddingBottom: spacing.xs,
      },

      nutritionRow: {
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
        gap: spacing.md,
      },

      nutritionRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },

      nutritionLabel: {
        flex: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },

      nutritionValue: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
      },

      sectionCard: {
        paddingBottom: spacing.md,
        gap: spacing.ms,
      },

      servingInputs: {
        gap: spacing.ms,
      },

      servingSizeField: {
        width: 116,
      },

      servingLabelField: {
        flex: 1,
      },

      fieldLabel: {
        ...typography.label,
        fontWeight: "500",
        color: colors.textSecondary,
        marginBottom: spacing.xs + 2,
      },

      inputFrame: {
        minHeight: 46,
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
      },

      inputFrameError: {
        borderColor: colors.danger,
      },

      input: {
        flex: 1,
        alignSelf: "stretch",
        ...typography.body,
        color: colors.textPrimary,
      },

      inputUnit: {
        ...typography.footnote,
        color: colors.textMuted,
      },

      errorText: {
        ...typography.caption,
        color: colors.danger,
      },

      previewBox: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
        paddingVertical: spacing.sm2,
        gap: 2,
      },

      previewLabel: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      previewText: {
        ...typography.callout,
        ...typography.number,
        fontWeight: "600",
        color: colors.textPrimary,
      },

      calcRow: {
        alignItems: "center",
        gap: spacing.ms,
      },

      calcToggle: {
        width: 140,
      },

      calcInputFrame: {
        flex: 1,
      },

      actions: {
        gap: spacing.sm,
      },
    }),
  );
