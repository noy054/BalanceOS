import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const chipStyles = StyleSheet.create({
  chip: {
    alignItems: 'baseline',
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginEnd: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 10,
    color: colors.primaryGreen,
    marginEnd: 2,
  },
  value: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  valueBold: {
    fontSize: 13,
    fontWeight: '800',
  },
  unit: {
    fontSize: 10,
    color: colors.primaryGreen,
  },
});

export const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  containerHighlight: {
    backgroundColor: colors.primaryGreenLight,
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
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    chipRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
