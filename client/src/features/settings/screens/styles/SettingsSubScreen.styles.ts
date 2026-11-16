import { StyleSheet } from 'react-native';

import { fonts, radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useSubScreenStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      flex: {
        flex: 1,
      },
      content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xl,
      },
      optionBlock: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        gap: spacing.ms,
      },
      note: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      marketRow: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 44,
      },
      marketRowPressed: {
        opacity: 0.7,
      },
      marketLabel: {
        flex: 1,
        ...typography.body,
        color: colors.textPrimary,
      },
      formCard: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
      },
      infoBanner: {
        backgroundColor: colors.accentSoft,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
        marginBottom: spacing.lg,
      },
      infoBannerText: {
        ...typography.callout,
        color: colors.textPrimary,
      },
      successBanner: {
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.successSoft,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
        marginBottom: spacing.md,
      },
      successText: {
        flex: 1,
        ...typography.callout,
        fontFamily: fonts.medium,
        color: colors.success,
      },
    }),
  );
