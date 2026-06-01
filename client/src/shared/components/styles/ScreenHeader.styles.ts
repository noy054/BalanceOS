import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    // flexDirection is applied dynamically via isRTL in the component
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm2,
    minHeight: 56,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  right: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
