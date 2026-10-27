import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useSubScreenStyles = () =>
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
      optionBlock: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        gap: spacing.ms,
      },
      note: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      formCard: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
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
      successBanner: {
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.successSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
        marginBottom: spacing.md,
      },
      successText: {
        flex: 1,
        ...typography.callout,
        fontWeight: '600',
        color: colors.success,
      },
    }),
  );
