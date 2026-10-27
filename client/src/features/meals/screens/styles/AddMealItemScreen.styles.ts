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
        maxHeight: 128,
      },

      cartRow: {
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 40,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },

      cartItemName: {
        flex: 1,
        ...typography.callout,
        color: colors.textPrimary,
      },

      cartItemQty: {
        ...typography.footnote,
        ...typography.number,
        fontWeight: '600',
        color: colors.textSecondary,
      },

      selectionSection: {
        gap: spacing.sm,
      },

      selectionName: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },

      selectionRow: {
        alignItems: 'center',
        gap: spacing.sm,
      },

      quantityField: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.sm,
      },

      quantityInput: {
        width: 88,
        minHeight: 48,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.surface,
        ...typography.headline,
        ...typography.number,
        color: colors.textPrimary,
        textAlign: 'center',
      },

      quantityUnit: {
        flexShrink: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },

      wholeMeal: {
        flex: 1,
        ...typography.callout,
        color: colors.textSecondary,
      },

      addToListButton: {
        minWidth: 132,
      },
    }),
  );
