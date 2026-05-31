import { View, TextInput, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius } from '../../../shared/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function PantrySearchBar({ value, onChangeText }: Props) {
  const { t } = useTranslation('pantry');

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  icon: {
    marginEnd: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
