import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xxl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    maxHeight: 520,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: { elevation: 8 },
    }),
  },

  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreenLight,
    borderWidth: 1,
    borderColor: colors.primaryGreenMid,
  },

  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  barcodeChip: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cardBackgroundStrong,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },

  barcodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  form: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
    marginBottom: 2,
  },

  actions: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },

  submitBtn: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.xl,
  },

  submitBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  submitBtnDisabled: { opacity: 0.5 },

  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },

  cancelBtn: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelBtnPressed: { opacity: 0.7 },

  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
