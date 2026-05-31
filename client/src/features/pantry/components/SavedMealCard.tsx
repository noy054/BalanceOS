import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { SavedMeal } from '../types';
import { NutritionTotals } from './NutritionTotals';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = {
  meal: SavedMeal;
  onPress: (meal: SavedMeal) => void;
};

export function SavedMealCard({ meal, onPress }: Props) {
  const { t } = useTranslation('pantry');
  const mealTypeLabel = meal.mealType
    ? t(`mealTypes.${meal.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(meal)}
    >
      <View style={styles.topRow}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
            {mealTypeLabel ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{mealTypeLabel}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.count}>
            {t('savedMealDetail.itemsCount', { count: meal.items.length })}
          </Text>
        </View>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="bookmark" size={26} color={colors.primaryGreenMid} />
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} style={styles.chevron} />
        </View>
      </View>
      <NutritionTotals totals={meal.totals} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow,
  },
  cardPressed: { opacity: 0.85 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  count: {
    fontSize: 11,
    color: colors.textMuted,
  },
  icon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: spacing.sm,
  },
  chevron: { marginStart: 2 },
});
