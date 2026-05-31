import { Pressable, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { MealShortcut } from '../types';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

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
        size={22}
        color={colors.primaryGreen}
        style={styles.icon}
      />
      <Text style={styles.label}>{t(`mealTypes.${shortcut.labelKey}`)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.8,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
