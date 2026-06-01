import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../src/shared/theme';

export const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.primaryGreen,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  field: { marginBottom: spacing.sm },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: { backgroundColor: colors.cardBackground },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  button: { borderRadius: radius.md, marginTop: spacing.xs },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  link: { color: colors.primaryGreen, fontWeight: '700', fontSize: 14 },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    inputContent: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    emailContent: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: 'ltr' as const,
    },
  };
}
