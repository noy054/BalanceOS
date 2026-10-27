import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Toggle } from '../../../shared/components/ui/Toggle';
import { useStyles, getDirectionStyles } from './styles/SettingsToggleRow.styles';

type Props = {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
  disabled?: boolean;
};

export function SettingsToggleRow({ label, hint, value, onValueChange, last = false, disabled = false }: Props) {
  const { i18n } = useTranslation();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        dir.row,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.label, disabled && styles.labelDisabled, dir.text]}>{label}</Text>
        {hint ? <Text style={[styles.hint, dir.text]}>{hint}</Text> : null}
      </View>
      <Toggle value={value} onValueChange={onValueChange} disabled={disabled} accessibilityLabel={label} />
    </Pressable>
  );
}
