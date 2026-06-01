import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const rowStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  labelHighlight: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  valueHighlight: {
    fontSize: 16,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
});

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  headerActions: {
    gap: spacing.xs,
  },
  headerActionBtn: {
    padding: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  barcodeRow: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  barcodeText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  nutritionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...cardShadow,
  },
  calcHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  calcRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calcInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
  },
  calcBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcResultCard: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  calcResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryGreen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryGreenMid,
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
