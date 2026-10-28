import { StyleSheet } from 'react-native';

import {
  radius,
  shadows,
  spacing,
  typography,
  useThemedStyles,
} from '../../../../shared/theme';

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

      controls: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
        gap: spacing.ms,
      },

      controlGroup: {
        gap: spacing.xs + 2,
      },

      controlLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
        flexGrow: 1,
      },

      dock: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.md,
        ...shadows.lg,
      },

      cartScroll: {
        maxHeight: 156,
        flexGrow: 0,
      },

      cartRow: {
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 48,
      },

      cartRowDivider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },

      cartText: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },

      cartItemName: {
        ...typography.callout,
        fontWeight: '600',
        color: colors.textPrimary,
      },

      cartItemQty: {
        ...typography.caption,
        ...typography.number,
        fontWeight: '400',
        color: colors.textSecondary,
      },

      cartItemCalories: {
        ...typography.callout,
        ...typography.number,
        fontWeight: '600',
        color: colors.textPrimary,
      },

      bar: {
        alignItems: 'center',
        gap: spacing.ms,
      },

      barSummary: {
        flex: 1,
        minWidth: 0,
      },

      barCount: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      barCalories: {
        ...typography.headline,
        ...typography.number,
        color: colors.textPrimary,
      },

      barButton: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 150,
      },
    }),
  );
