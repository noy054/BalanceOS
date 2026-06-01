import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    marginBottom: spacing.sm,
  },
  actionsRow: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    paddingVertical: spacing.sm2,
    gap: spacing.xs,
    minHeight: 44,
  },
  actionBtnOutline: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cardBackground,
    letterSpacing: 0.1,
  },
  actionBtnTextOutline: {
    color: colors.primaryGreen,
  },
  content: {
    flex: 1,
    marginTop: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
  };
}
