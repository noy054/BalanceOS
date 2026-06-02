import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  comingSoonBanner: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  comingSoonText: {
    fontSize: 12,
    color: colors.primaryGreen,
  },
  reminderRow: { paddingBottom: spacing.xs },
  reminderRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  timeRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  timeInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 14,
    color: colors.textPrimary,
    width: 100,
    alignSelf: 'flex-end',
  },
  intervalRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  intervalLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  intervalInput: {
    width: 80,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  weeklyOptions: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  dayChips: {
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    justifyContent: 'flex-end',
  },
  dayChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cardBackground,
  },
  dayChipActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreenLight,
  },
  dayChipText: { fontSize: 12, color: colors.textSecondary },
  dayChipTextActive: { color: colors.primaryGreen, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#081008', letterSpacing: 0.2 },
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
