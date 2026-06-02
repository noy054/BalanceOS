import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },

  tabActive: {
    borderColor: colors.primaryGreenMid,
    backgroundColor: colors.primaryGreenLight,
  },

  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },

  tabLabelActive: {
    color: colors.primaryGreen,
    fontWeight: '800',
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  searchInput: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },

  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // ── Item card ─────────────────────────────────────────────────────────────
  itemCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
  },

  itemCardSelected: {
    borderColor: colors.primaryGreenMid,
    backgroundColor: colors.primaryGreenLight,
  },

  itemCardPressed: {
    opacity: 0.8,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  itemSub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
  },

  itemMacros: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // ── Log panel (shown when item is selected) ───────────────────────────────
  logPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -6 },
      },
      android: { elevation: 8 },
    }),
  },

  logPanelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  logPanelSub: {
    fontSize: 12,
    color: colors.textMuted,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  quantityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 52,
  },

  quantityInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  logBtn: {
    height: 50,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },

  logBtnDisabled: {
    opacity: 0.5,
  },

  logBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  logBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.2,
  },

  // ── Done button (header right element) ────────────────────────────────────
  doneBtn: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryGreen,
    paddingHorizontal: spacing.xs,
  },

  // ── Meal type picker (general mode) ───────────────────────────────────────
  mealTypeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  mealTypeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },

  mealTypeBtnActive: {
    borderColor: colors.primaryGreenMid,
    backgroundColor: colors.primaryGreenLight,
  },

  mealTypeBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },

  mealTypeBtnLabelActive: {
    color: colors.primaryGreen,
  },

  // ── Cart section ───────────────────────────────────────────────────────────
  cartSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },

  cartHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  cartItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  cartItemQty: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },

  cartRemoveBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackgroundSoft,
  },

  // ── Save footer ────────────────────────────────────────────────────────────
  saveFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },

  saveBtn: {
    height: 54,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryGreen,
        shadowOpacity: 0.22,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
  },

  saveBtnDisabled: { opacity: 0.5 },

  saveBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },

  saveBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.2,
  },
});
