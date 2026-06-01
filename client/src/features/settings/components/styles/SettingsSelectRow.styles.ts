import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chips: {
    gap: spacing.xs,
    marginStart: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cardBackground,
  },
  chipActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreenLight,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  chipTextDisabled: {
    color: colors.textMuted,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    chipsRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
    },
  };
}
