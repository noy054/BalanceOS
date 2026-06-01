import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  requiredHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cardBackground,
    letterSpacing: 0.2,
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
    centeredText: {
      textAlign: 'center' as const,
    },
  };
}
