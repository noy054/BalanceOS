import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../src/shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },
      container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
      },
      logo: {
        alignSelf: 'center',
        marginBottom: spacing.xl,
      },
      title: {
        ...typography.headline,
        fontWeight: '500',
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: spacing.xl,
      },
      card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        paddingVertical: spacing.ml,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.ms,
        alignItems: 'center',
        backgroundColor: colors.surface,
        gap: spacing.xs,
      },
      cardActive: {
        borderColor: colors.accent,
        borderWidth: 1.5,
      },
      cardPressed: {
        backgroundColor: colors.accentSoft,
      },
      cardTitle: {
        ...typography.title,
        color: colors.textPrimary,
      },
      cardSub: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      badge: {
        marginTop: spacing.xs,
        backgroundColor: colors.accentSoft,
        borderRadius: radius.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
      },
      badgeText: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.accent,
      },
    }),
  );
