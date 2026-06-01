import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  fieldGroup: { marginBottom: spacing.md },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 48,
  },
  inputError: { borderColor: colors.danger },
  mealTypeRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  mealTypeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.cardBackground,
  },
  mealTypeChipActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreenLight,
  },
  mealTypeText: { fontSize: 12, color: colors.textMuted },
  mealTypeTextActive: { color: colors.primaryGreen, fontWeight: '600' },
  itemRow: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  itemKind: { fontSize: 11, color: colors.textSecondary },
  amountInput: {
    width: 64,
    height: 36,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  unitLabel: { fontSize: 12, color: colors.textMuted },
  removeBtn: { padding: spacing.xs },
  addButtonsRow: { gap: spacing.sm, marginBottom: spacing.md },
  addItemBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addItemText: { fontSize: 13, fontWeight: '600', color: colors.primaryGreen },
  totalsContainer: { marginBottom: spacing.md },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.cardBackground, letterSpacing: 0.2 },
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
