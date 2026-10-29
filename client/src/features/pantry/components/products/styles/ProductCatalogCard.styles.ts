import { StyleSheet } from "react-native";

import {
  fonts,
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

      servingLine: {
        ...typography.footnote,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
        marginTop: -spacing.sm,
      },

      missingNotice: {
        alignItems: "flex-start",
        gap: spacing.sm,
        backgroundColor: colors.warningSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
      },

      missingNoticeText: {
        flex: 1,
        ...typography.footnote,
        color: colors.textPrimary,
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





      inputFrame: {
        minHeight: 46,
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
      },


      input: {
        flex: 1,
        alignSelf: "stretch",
        ...typography.body,
        color: colors.textPrimary,
      },



      previewBox: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        paddingHorizontal: spacing.ms,
        paddingVertical: spacing.sm2,
        gap: 2,
      },


      previewText: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
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
