import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../src/shared/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
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
