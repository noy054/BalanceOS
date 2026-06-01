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
    marginBottom: spacing.xl,
  },
  logoBalance: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoOS: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryGreen,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.xl,
  },
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    ...cardShadow,
  },
  cardActive: {
    borderColor: colors.primaryGreen,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
});
