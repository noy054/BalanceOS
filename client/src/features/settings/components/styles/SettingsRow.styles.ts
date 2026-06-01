import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flex: 1 },
  label: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  labelDestructive: { color: colors.danger },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  right: {
    alignItems: 'center',
    gap: spacing.xs,
    marginStart: spacing.sm,
  },
  pressed: { opacity: 0.7 },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    rightRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
    },
  };
}
