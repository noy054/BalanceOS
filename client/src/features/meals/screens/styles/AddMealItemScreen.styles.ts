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

      radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.xs,
      },

      radioActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
      },

      dock: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.ms,
        ...shadows.lg,
      },

      dockLabel: {
        ...typography.label,
        color: colors.textSecondary,
      },

      cartSection: {
        gap: spacing.xs,
      },

      cartScroll: {
        maxHeight: 148,
      },

      cartRow: {
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 44,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },

      cartItemName: {
        ...typography.callout,
        color: colors.textPrimary,
      },

      cartItemQty: {
        ...typography.caption,
        ...typography.number,
        fontWeight: '400',
        color: colors.textSecondary,
      },

      quickActions: {
        gap: spacing.sm,
      },

      quickAction: {
        flex: 1,
      },

      cartHeader: {
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
      },

      cartTotal: {
        ...typography.footnote,
        ...typography.number,
        fontWeight: '600',
        color: colors.textPrimary,
      },

      cartText: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },

      cartItemCalories: {
        ...typography.footnote,
        ...typography.number,
        fontWeight: '600',
        color: colors.textSecondary,
      },
    }),
  );
