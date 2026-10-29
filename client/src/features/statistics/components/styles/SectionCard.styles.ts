import { StyleSheet } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },
      cardTitle: {
        ...typography.headline,
        color: colors.textPrimary,
        marginBottom: spacing.ms,
      },
    }),
  );
