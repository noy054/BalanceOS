import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../src/shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      title: {
        ...typography.title,
        fontSize: 28,
        lineHeight: 34,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
      },
      subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
      },
      input: { marginBottom: spacing.ms, backgroundColor: colors.inputBackground },
      grid: { gap: spacing.ms },
      gridCell: { flex: 1 },
      btnContent: { height: 50 },
      btnLabel: { ...typography.bodyStrong, letterSpacing: 0 },
      button: { marginTop: spacing.sm, borderRadius: radius.md },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
