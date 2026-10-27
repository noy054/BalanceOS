import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

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
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
        marginBottom: spacing.lg,
      },

      infoBannerText: {
        ...typography.callout,
        color: colors.textPrimary,
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
