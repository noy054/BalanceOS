import { View, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/SettingsToggleRow.styles';

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
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.row, !last && styles.rowBorder, dir.row]}>
      <View style={styles.left}>
        <Text style={[styles.label, disabled && styles.labelDisabled, dir.text]}>{label}</Text>
        {hint ? <Text style={[styles.hint, dir.text]}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryGreenMid }}
        thumbColor={value ? colors.primaryGreen : colors.textMuted}
        disabled={disabled}
      />
    </View>
  );
}
