import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        gap: spacing.ms,
      },
      pressed: {
        backgroundColor: colors.surfaceMuted,
      },
      iconWrap: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
      },
      iconWrapDestructive: {
        backgroundColor: colors.dangerSoft,
      },
      body: {
        flex: 1,
        alignItems: 'center',
        minHeight: 56,
        paddingVertical: spacing.sm2,
        gap: spacing.sm,
      },
      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      left: {
        flex: 1,
        gap: 2,
      },
      label: {
        ...typography.body,
        color: colors.textPrimary,
      },
      labelDestructive: {
        color: colors.danger,
      },
      hint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      right: {
        alignItems: 'center',
        gap: spacing.xs,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    rightRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
  };
}
