import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  tabActive: {},
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primaryGreen,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
