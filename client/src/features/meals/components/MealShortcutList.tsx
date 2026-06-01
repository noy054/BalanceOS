import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MealShortcutCard } from './MealShortcutCard';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { MealShortcut } from '../types';
import { styles } from './styles/MealShortcutList.styles';

type Props = {
  onSelect?: (type: MealShortcut['type']) => void;
};

export function MealShortcutList({ onSelect }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  return (
    <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      {MEAL_SHORTCUTS.map((shortcut) => (
        <MealShortcutCard
          key={shortcut.type}
          shortcut={shortcut}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}
