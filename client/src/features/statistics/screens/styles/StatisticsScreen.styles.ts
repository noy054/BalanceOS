import { StyleSheet } from 'react-native';
import { spacing, radius, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },
      header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      title: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -0.5,
      },
      subtitle: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
      },
      rangeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
      },
      rangeChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: 7,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.cardBackgroundSoft,
      },
      rangeChipActive: {
        backgroundColor: colors.primaryGreenLight,
        borderColor: colors.primaryGreenMid,
      },
      rangeChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
      },
      rangeChipTextActive: {
        color: colors.primaryGreen,
      },
      scroll: {
        flex: 1,
      },
      scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
      },
      centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      },
      emptyTitle: {
        fontSize: 17,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
      },
      emptyText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
      },
      errorText: {
        fontSize: 14,
        color: colors.danger,
        textAlign: 'center',
      },
    }),
  );

export function getRangeStyles(isRTL: boolean) {
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
