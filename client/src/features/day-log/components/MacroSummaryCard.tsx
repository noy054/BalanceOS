import { Fragment } from 'react';
import { View } from 'react-native';
import { MacroItem } from '../types';
import { MacroProgressItem } from './MacroProgressItem';
import { styles } from './styles/MacroSummaryCard.styles';

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
