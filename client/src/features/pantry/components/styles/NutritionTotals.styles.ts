import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(168, 241, 42, 0.10)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginEnd: spacing.xs,
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: colors.primaryGreen,
    marginEnd: 2,
    fontWeight: '500',
  },
  value: {
    fontSize: 11,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  valueBold: {
    fontSize: 12,
    fontWeight: '800',
  },
  unit: {
    fontSize: 9,
    color: colors.primaryGreen,
    opacity: 0.8,
  },
});

export const styles = StyleSheet.create({
  container: {
    borderRadius: radius.sm,
    paddingTop: 4,
  },
  containerHighlight: {
    backgroundColor: 'rgba(168, 241, 42, 0.08)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  labelHighlight: {
    color: colors.primaryGreen,
  },
  row: {
    flexWrap: 'wrap',
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    label: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    chipRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
