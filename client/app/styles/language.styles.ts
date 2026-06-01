import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../src/shared/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl + spacing.sm,
  },
  logoBalance: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.7,
  },
  logoOS: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: -0.7,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    ...cardShadow,
  },
  cardActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreenLight,
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: colors.cardBackground,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
