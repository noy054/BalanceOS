import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow,
  },
  cardPressed: { opacity: 0.85 },
  topRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  count: {
    fontSize: 11,
    color: colors.textMuted,
  },
  icon: {
    alignItems: 'center',
    marginStart: spacing.sm,
  },
  chevron: { marginStart: 2 },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
