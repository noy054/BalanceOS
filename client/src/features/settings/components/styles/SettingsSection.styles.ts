import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  titleDanger: { color: colors.danger },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...cardShadow,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    title: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
    },
  };
}
