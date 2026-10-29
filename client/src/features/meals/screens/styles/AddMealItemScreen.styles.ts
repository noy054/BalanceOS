import { StyleSheet } from 'react-native';

import {
  fonts,
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
      },

      list: {
        flex: 1,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
        flexGrow: 1,
      },

      dock: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ms,
        gap: spacing.ms,
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
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },

      cartItemQty: {
        ...typography.footnote,
        ...typography.number,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },

      cartItemCalories: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
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
        ...typography.value,
        color: colors.textPrimary,
      },

      barButton: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 150,
      },
    }),
  );
