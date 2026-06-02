import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../src/shared/theme';

export const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  input: { marginBottom: spacing.sm, backgroundColor: colors.inputBackground },
  btnContent: { height: 56 },
  btnLabel: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2, color: '#081008' },
  button: { marginTop: spacing.sm, borderRadius: radius.md },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
  };
}
