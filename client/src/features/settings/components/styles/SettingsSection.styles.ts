import { StyleSheet } from 'react-native';

import { radius, spacing, useThemedStyles } from '../../../../shared/theme';

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      wrapper: {
        marginBottom: spacing.lg,
      },
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        overflow: 'hidden',
      },
      cardDanger: {
        borderColor: colors.dangerSoft,
      },
    }),
  );
