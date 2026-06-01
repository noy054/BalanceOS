import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

export const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
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
