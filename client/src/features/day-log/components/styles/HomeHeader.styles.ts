import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBalance: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  logoOS: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryGreen,
    letterSpacing: -0.3,
  },
  logoLeaf: {
    marginStart: 4,
    marginTop: 1,
  },
  settingsButton: {
    padding: spacing.xs,
  },
});
