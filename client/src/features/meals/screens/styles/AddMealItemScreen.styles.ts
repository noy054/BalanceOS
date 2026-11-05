import { StyleSheet } from 'react-native';

import {
  radius,
  shadows,
  spacing,
  typography,
  useThemedStyles,
} from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.background,
      },

      flex: {
        flex: 1,
      },

      controls: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
        gap: spacing.ms,
      },

      controlGroup: {
        gap: spacing.xs + 2,
      },

      controlLabel: {
        ...typography.caption,
        color: colors.textSecondary,
      },

      list: {
        flex: 1,
      },

      listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
        flexGrow: 1,
      },

      dock: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
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
