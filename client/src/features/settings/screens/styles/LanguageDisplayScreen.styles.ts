import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  optionRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chips: {
    gap: spacing.xs,
    marginStart: spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.cardBackground,
  },
  chipActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreenLight,
  },
  chipDisabled: { opacity: 0.35 },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: { color: colors.primaryGreen, fontWeight: '700' },
  chipTextDisabled: { color: colors.textMuted },
  rtlNote: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  rtlNoteText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  darkComingSoon: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  darkComingSoonText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    chipsRow: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
  };
}
