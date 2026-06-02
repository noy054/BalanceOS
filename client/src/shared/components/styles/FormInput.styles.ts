import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

export const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  inputDisabled: {
    opacity: 0.45,
  },
  inputMultiline: {
    minHeight: 84,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
  };
}
