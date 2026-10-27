import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '../../../shared/components/ui/SegmentedControl';
import { useStyles, getDirectionStyles } from './styles/SettingsSelectRow.styles';

type Option<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  last?: boolean;
};

export function SettingsSelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
  last = false,
}: Props<T>) {
  const { i18n } = useTranslation();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[styles.label, dir.text]}>{label}</Text>
      <SegmentedControl
        options={options}
        value={value}
        onChange={(next) => onChange(next)}
        size="sm"
      />
    </View>
  );
}
