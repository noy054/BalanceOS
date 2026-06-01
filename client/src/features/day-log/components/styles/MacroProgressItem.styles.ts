import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  separator: {
    fontSize: 13,
    color: colors.textMuted,
  },
  targetValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  unit: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: colors.progressTrack,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: 3,
  },
});
