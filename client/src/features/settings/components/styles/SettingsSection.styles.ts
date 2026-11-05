import { StyleSheet } from 'react-native';

import { withAlpha } from '../../../../shared/helpers/progressColor';
import { radius, spacing, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      wrapper: {
        marginBottom: spacing.lg,
      },
      header: {
        paddingHorizontal: spacing.xs,
      },
      card: {
        backgroundColor: colors.glassCard,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        overflow: 'hidden',
      },
      cardDanger: {
        borderColor: withAlpha(colors.danger, 0.35),
        backgroundColor: withAlpha(colors.danger, 0.05),
      },
    }),
  );
