import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../src/shared/theme';

export const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl + spacing.sm },
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
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  field: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 7,
  },
  input: { backgroundColor: colors.cardBackground },
  btnContent: { height: 54 },
  btnLabel: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  primaryBtn: { borderRadius: radius.md, marginTop: spacing.sm },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.textMuted, letterSpacing: 0.5 },
  googleBtn: { borderRadius: radius.md, borderColor: colors.border, borderWidth: 1.5 },
  googleLabel: { fontSize: 14, fontWeight: '500' },
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
