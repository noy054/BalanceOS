import { StyleSheet } from 'react-native';

import { fonts, radius, shadows, spacing, typography, useThemedStyles } from '../../../../shared/theme';
import { withAlpha } from '../../../../shared/helpers/progressColor';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.canvas,
      },

      header: {
        alignItems: 'center',
        minHeight: 52,
        paddingHorizontal: spacing.md,
      },

      backButton: {
        borderRadius: 12,
      },

      headerTitle: {
        position: 'absolute',
        left: 64,
        right: 64,
        alignItems: 'center',
      },

      title: {
        fontFamily: fonts.headingBold,
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
      },

      subtitle: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      controls: {
        paddingHorizontal: spacing.md,
        paddingTop: 6,
        paddingBottom: spacing.sm,
        gap: 14,
      },

      searchField: {
        minHeight: 48,
        borderRadius: 16,
        paddingEnd: 6,
      },

      scanButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: withAlpha(colors.gloss, 0.1),
      },

      list: {
        flex: 1,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
        flexGrow: 1,
      },

      sectionHeader: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 4,
        paddingBottom: 10,
      },

      sectionTitleRow: {
        alignItems: 'center',
        gap: 6,
      },

      sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: 15,
        color: colors.textPrimary,
      },

      sectionLink: {
        alignItems: 'center',
        gap: 2,
        minHeight: 32,
      },

      sectionLinkText: {
        fontFamily: fonts.semibold,
        fontSize: 13,
        color: colors.accent,
      },

      createLink: {
        alignSelf: 'center',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
        marginTop: 6,
        paddingHorizontal: 12,
      },

      createLinkText: {
        fontFamily: fonts.medium,
        fontSize: 13,
        color: colors.textSecondary,
      },

      dock: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        borderTopWidth: 1,
        borderColor: withAlpha(colors.gloss, 0.08),
        paddingHorizontal: spacing.md,
        paddingTop: spacing.ms,
        gap: spacing.ms,
        ...shadows.lg,
      },

      notice: {
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.ms,
        borderRadius: radius.md,
        backgroundColor: colors.warningSoft,
      },

      noticeText: {
        flex: 1,
        ...typography.footnote,
        color: colors.textPrimary,
      },
    }),
  );
