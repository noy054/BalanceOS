import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../shared/theme';

export const authScreenStyles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: colors.cardBackground,
  },
  button: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
