import { Pressable, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { MealShortcut } from '../types';
import { colors } from '../../../shared/theme';
import { styles } from './styles/MealShortcutCard.styles';

type Props = {
  shortcut: MealShortcut;
  onPress?: (type: MealShortcut['type']) => void;
};

export function MealShortcutCard({ shortcut, onPress }: Props) {
  const { t } = useTranslation('dashboard');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(shortcut.type)}
    >
      <MaterialCommunityIcons
        name={shortcut.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={26}
        color={colors.primaryGreen}
        style={styles.icon}
      />
      <Text style={styles.label}>{t(`mealTypes.${shortcut.labelKey}`)}</Text>
    </Pressable>
  );
}
