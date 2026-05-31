import { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';
import { MacroItem } from '../types';
import { MacroProgressItem } from './MacroProgressItem';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = {
  macros: MacroItem[];
};

export function MacroSummaryCard({ macros }: Props) {
  return (
    <View style={styles.card}>
      {macros.map((macro, index) => (
        <Fragment key={macro.key}>
          {index > 0 && <View style={styles.divider} />}
          <MacroProgressItem macro={macro} />
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    ...cardShadow,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
