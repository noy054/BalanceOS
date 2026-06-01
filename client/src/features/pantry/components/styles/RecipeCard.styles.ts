import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm2 + 2,
    paddingBottom: spacing.sm2,
    ...cardShadow,
  },
  cardPressed: { opacity: 0.82 },
  topRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  count: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  icon: {
    alignItems: 'center',
    marginStart: spacing.sm,
    gap: 2,
  },
  chevron: {},
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
