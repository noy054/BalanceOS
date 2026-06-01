import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import { styles, getDirectionStyles } from './styles/FormInput.styles';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  placeholder?: string;
  editable?: boolean;
  returnKeyType?: 'next' | 'done' | 'go' | 'search' | 'send';
};

export function FormInput({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  autoFocus,
  secureTextEntry,
  multiline,
  placeholder,
  editable = true,
  returnKeyType = 'next',
}: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, dir.text]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        editable={editable}
        returnKeyType={returnKeyType}
        textAlign={dir.text.textAlign}
      />
      {error ? <Text style={[styles.error, dir.text]}>{error}</Text> : null}
    </View>
  );
}
