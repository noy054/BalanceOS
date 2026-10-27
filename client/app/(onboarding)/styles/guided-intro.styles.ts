import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../src/shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      brand: {
        marginBottom: spacing.ml,
      },
      title: {
        ...typography.title,
        fontSize: 28,
        lineHeight: 34,
        color: colors.textPrimary,
        marginBottom: spacing.md,
      },
      body: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.md,
      },
      btnContent: { height: 50 },
      btnLabel: { ...typography.bodyStrong, letterSpacing: 0 },
      button: { marginTop: spacing.md, borderRadius: radius.md },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    alignStart: {
      alignSelf: isRTL ? 'flex-end' as const : 'flex-start' as const,
    },
  };
}
