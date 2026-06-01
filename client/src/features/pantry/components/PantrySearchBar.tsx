import { View, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/PantrySearchBar.styles';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function PantrySearchBar({ value, onChangeText }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.container, dir.row]}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, dir.input]}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
      />
    </View>
  );
}
