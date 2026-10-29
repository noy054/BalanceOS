import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
        gap: spacing.ms,
      },
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.sm,
      },
      cardActive: {
        borderColor: colors.accent,
        borderWidth: 1.5,
      },
      cardPressed: {
        opacity: 0.8,
      },
      cardHeader: {
        alignItems: 'center',
        gap: spacing.ms,
      },
      iconCircle: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
      },
      iconCircleActive: {
        backgroundColor: colors.accentSoft,
      },
      cardTitle: {
        flex: 1,
        ...typography.headline,
        color: colors.textPrimary,
      },
      radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
      },
      radioActive: {
        borderColor: colors.accent,
      },
      radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.accentFill,
      },
      cardDescription: {
        ...typography.callout,
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
