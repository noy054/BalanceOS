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
        marginBottom: spacing.sm,
      },
      subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
      },
      card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.ms,
        backgroundColor: colors.surface,
        alignItems: 'center',
        gap: spacing.ms,
      },
      cardPressed: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },
      iconWrap: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
      },
      cardText: {
        flex: 1,
        gap: spacing.xs,
      },
      cardTitle: {
        ...typography.headline,
        color: colors.textPrimary,
      },
      cardDesc: {
        ...typography.callout,
        color: colors.textSecondary,
      },
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
    alignStart: {
      alignSelf: isRTL ? 'flex-end' as const : 'flex-start' as const,
    },
  };
}
