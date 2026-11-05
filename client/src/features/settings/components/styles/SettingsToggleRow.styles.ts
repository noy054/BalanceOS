import { StyleSheet } from 'react-native';

import { spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm2,
        minHeight: 56,
        gap: spacing.ms,
      },
      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },
      pressed: {
        backgroundColor: colors.glassBorder,
      },
      left: {
        flex: 1,
        gap: 2,
      },
      label: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      labelDisabled: {
        color: colors.textMuted,
      },
      hint: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
  };
}
