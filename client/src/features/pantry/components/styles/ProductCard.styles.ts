import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginEnd: spacing.xs,
    marginTop: 5,
  },
  label: {
    fontSize: 10,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  labelBold: {
    fontWeight: '700',
    fontSize: 11,
  },
  unit: {
    fontSize: 9,
    color: colors.primaryGreen,
    opacity: 0.8,
  },
});

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2 + 2,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.82,
  },
  mainRow: {
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  brand: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  macroRow: {
    flexWrap: 'wrap',
  },
  trailing: {
    alignItems: 'center',
    marginStart: spacing.sm,
    gap: 4,
  },
  barcodeIcon: {},
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    pillRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    macroRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
