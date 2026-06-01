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
  ingredientRow: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  ingredientInfo: { flex: 1 },
  ingredientName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  ingredientBrand: { fontSize: 11, color: colors.textSecondary },
  gramsInput: {
    width: 64,
    height: 36,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  gramsLabel: { fontSize: 12, color: colors.textMuted },
  removeBtn: { padding: spacing.xs },
  addIngredientBtn: {
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderStyle: 'dashed',
  },
  addIngredientText: { fontSize: 14, fontWeight: '600', color: colors.primaryGreen },
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
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.cardBackground },
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
