import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: colors.textMuted },
  deleteBtn: { padding: spacing.xs },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    ...cardShadow,
    overflow: 'hidden',
  },
  ingredientRow: {
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  ingredientInfo: { flex: 1 },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  ingredientBrand: { fontSize: 11, color: colors.textSecondary },
  ingredientGrams: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  ingredientNutrition: { alignItems: 'flex-end' },
  ingredientCals: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  ingredientMacros: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
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
