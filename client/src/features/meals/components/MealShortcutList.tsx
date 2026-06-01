import { View } from 'react-native';
import { MealShortcutCard } from './MealShortcutCard';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { MealShortcut } from '../types';
import { styles } from './styles/MealShortcutList.styles';

type Props = {
  onSelect?: (type: MealShortcut['type']) => void;
};

export function MealShortcutList({ onSelect }: Props) {
  return (
    <View style={styles.row}>
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
