import { View, StyleSheet } from 'react-native';
import { MealShortcutCard } from './MealShortcutCard';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { MealShortcut } from '../types';
import { spacing } from '../../../shared/theme';

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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
