import { StyleSheet } from 'react-native';

import { radius, spacing, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: spacing.sm2,
        paddingVertical: spacing.sm2,
        gap: spacing.sm,
      },

      cardSelected: {
        borderColor: colors.primaryGreenMid,
        backgroundColor: colors.primaryGreenLight,
      },

      cardPressed: {
        opacity: 0.8,
      },

      headerRow: {
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingHorizontal: spacing.xs,
      },

      titleBox: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },

      name: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '700',
        color: colors.textPrimary,
      },

      subtitle: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
        color: colors.textMuted,
      },

      basisBadge: {
        flexShrink: 0,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        backgroundColor: colors.cardBackgroundSoft,
        borderWidth: 1,
        borderColor: colors.border,
      },

      basisText: {
        fontSize: 10,
        lineHeight: 13,
        fontWeight: '700',
        color: colors.textSecondary,
      },

      macrosRow: {
        gap: spacing.xs,
      },

      macroCell: {
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: 2,
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: 2,
        borderRadius: radius.md,
        backgroundColor: colors.cardBackgroundSoft,
      },

      macroCellPrimary: {
        flex: 1.35,
        backgroundColor: colors.primaryGreenLight,
      },

      macroLabel: {
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '600',
        color: colors.textMuted,
        textAlign: 'center',
      },

      macroLabelPrimary: {
        color: colors.textSecondary,
      },

      macroValue: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
      },

      macroValuePrimary: {
        color: colors.primaryGreen,
      },

      macroUnit: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textMuted,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const),
    },

    text: {
      textAlign: isRTL ? ('right' as const) : ('left' as const),
      writingDirection: isRTL ? ('rtl' as const) : ('ltr' as const),
    },

    writing: {
      writingDirection: isRTL ? ('rtl' as const) : ('ltr' as const),
    },
  };
}
