import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../src/shared/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: colors.background,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBalance: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  logoOS: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primaryGreen,
    letterSpacing: -1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.60)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: { elevation: 7 },
    }),
  },
  cardActive: {
    borderColor: colors.primaryGreen,
    borderWidth: 1.5,
    backgroundColor: 'rgba(168, 241, 42, 0.05)',
  },
  cardPressed: { opacity: 0.82 },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#081008',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
