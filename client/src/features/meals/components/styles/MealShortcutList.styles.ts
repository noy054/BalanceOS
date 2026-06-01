import { StyleSheet } from 'react-native';
import { spacing } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  row: {
    // flexDirection applied dynamically via isRTL
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
