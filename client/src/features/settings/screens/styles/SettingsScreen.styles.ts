import { StyleSheet } from 'react-native';

import { fonts, radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      scroll: { flex: 1 },
      content: { paddingBottom: spacing.xl },
      body: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
      userCard: {
        alignItems: 'center',
        backgroundColor: colors.glassCard,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.ms,
      },
      userCardPressed: {
        backgroundColor: colors.glassBorder,
      },
      avatar: {
        width: 52,
        height: 52,
        borderRadius: radius.round,
        backgroundColor: colors.accentFill,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      avatarInitials: {
        ...typography.headline,
        fontFamily: fonts.headingSemibold,
        color: colors.onAccent,
      },
      userInfo: { flex: 1, minWidth: 0, gap: 1 },
      userName: {
        ...typography.headline,
        color: colors.textPrimary,
      },
      userEmail: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      userAction: {
        ...typography.label,
        marginTop: spacing.xxs,
        color: colors.accent,
      },
    }),
  );
