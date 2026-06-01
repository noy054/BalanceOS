import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  icon: {
    marginEnd: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    input: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
    },
  };
}
