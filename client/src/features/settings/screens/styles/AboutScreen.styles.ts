import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  appCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...cardShadow,
  },
  logoMark: {
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  logoBalance: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  logoOS: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primaryGreen,
    letterSpacing: -0.3,
  },
  versionBadge: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    logoRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
