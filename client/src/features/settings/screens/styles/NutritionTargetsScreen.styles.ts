import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({

      flex: {
        flex: 1,
      },

      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
      },

      infoBanner: {
        backgroundColor: colors.accentSoft,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
        marginBottom: spacing.lg,
      },

      infoBannerText: {
        ...typography.callout,
        color: colors.textPrimary,
      },

      calculated: {
        padding: spacing.md,
        gap: spacing.sm,
      },

      upToDate: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      missingCard: {
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        marginBottom: spacing.lg,
      },

      missingTitle: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },

      missingBody: {
        ...typography.footnote,
        color: colors.textSecondary,
      },

      formCard: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },

      grid: {
        gap: spacing.ms,
      },

      gridCell: {
        flex: 1,
      },
    }),
  );
