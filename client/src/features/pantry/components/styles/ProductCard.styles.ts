import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const pillStyles = StyleSheet.create({
  pill: {
    alignItems: 'baseline',
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginEnd: spacing.xs,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: 11,
    color: colors.primaryGreen,
  },
  labelBold: {
    fontWeight: '700',
  },
  unit: {
    fontSize: 10,
    color: colors.primaryGreen,
  },
});

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.85,
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
    marginBottom: 2,
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
  },
  barcodeIcon: {
    marginBottom: 4,
  },
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
