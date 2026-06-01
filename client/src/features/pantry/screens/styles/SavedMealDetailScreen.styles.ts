import { StyleSheet } from 'react-native';
import { colors, spacing, radius, cardShadow } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: colors.textMuted },
  deleteBtn: { padding: spacing.xs },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  badgeRow: { alignItems: 'flex-end', marginBottom: spacing.sm },
  badge: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: { fontSize: 12, color: colors.primaryGreen, fontWeight: '600' },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    ...cardShadow,
    overflow: 'hidden',
  },
  itemRow: {
    alignItems: 'center',
    padding: spacing.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  itemDetail: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  itemCals: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen, marginStart: spacing.sm },
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
    sectionTitle: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
    },
  };
}
