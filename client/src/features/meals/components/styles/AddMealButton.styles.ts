import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cardBackground,
    letterSpacing: 0.2,
  },
});
