import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      scroll: { flex: 1 },
      content: { paddingBottom: spacing.md },
      body: { paddingHorizontal: spacing.md },
      userCard: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.ms,
      },
      avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      avatarInitials: {
        ...typography.headline,
        color: colors.accent,
      },
      userInfo: { flex: 1, gap: 2 },
      userName: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      userEmail: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );

export function getDirectionStyles(isRTL: boolean) {
  return {
    row: {
      flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
    },
    text: {
      textAlign: isRTL ? 'right' as const : 'left' as const,
      writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
    },
  };
}
