import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles, getDirectionStyles } from './styles/SettingsSelectRow.styles';

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
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.row, !last && styles.rowBorder, dir.row]}>
      <Text style={[styles.label, dir.text]}>{label}</Text>
      <View style={[styles.chips, dir.chipsRow]}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              styles.chip,
              value === opt.value && styles.chipActive,
              opt.disabled && styles.chipDisabled,
            ]}
            onPress={() => !opt.disabled && onChange(opt.value)}
            disabled={opt.disabled}
          >
            <Text
              style={[
                styles.chipText,
                value === opt.value && styles.chipTextActive,
                opt.disabled && styles.chipTextDisabled,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
