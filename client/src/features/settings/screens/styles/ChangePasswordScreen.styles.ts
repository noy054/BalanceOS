import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      flex: { flex: 1 },
      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
        gap: spacing.md,
      },
      formCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },
      successBanner: {
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.successSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
      },
      successText: {
        flex: 1,
        ...typography.callout,
        fontWeight: '600',
        color: colors.success,
      },
    }),
  );
