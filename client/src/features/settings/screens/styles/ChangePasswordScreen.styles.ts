import { StyleSheet } from 'react-native';

import { fonts, radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

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
        fontFamily: fonts.semibold,
        color: colors.success,
      },
    }),
  );
