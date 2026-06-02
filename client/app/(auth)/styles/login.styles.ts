import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../src/shared/theme';

export const styles = StyleSheet.create({
  header: { marginBottom: 36 },
  brand: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.8,
    color: colors.primaryGreen,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  field: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  input: { backgroundColor: colors.inputBackground },
  btnContent: { height: 56 },
  btnLabel: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2, color: '#081008' },
  primaryBtn: { borderRadius: radius.md, marginTop: spacing.sm },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.textMuted, letterSpacing: 0.5, fontWeight: '600' },
  googleBtn: { borderRadius: radius.md, borderColor: colors.border, borderWidth: 1.5 },
  googleLabel: { fontSize: 14, fontWeight: '600' },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: spacing.xs,
  },
  footerText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  link: { color: colors.primaryGreen, fontWeight: '800', fontSize: 14 },
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
