import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { SavedMeal } from '../types';
import { NutritionTotals } from './NutritionTotals';
import { colors, spacing } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/SavedMealCard.styles';

type Props = {
  meal: SavedMeal;
  onPress: (meal: SavedMeal) => void;
};

export function SavedMealCard({ meal, onPress }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const mealTypeLabel = meal.mealType
    ? t(`mealTypes.${meal.mealType}` as Parameters<typeof t>[0])
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(meal)}
    >
      <View style={[styles.topRow, dir.row]}>
        <View style={styles.info}>
          <View style={[styles.nameRow, dir.row]}>
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
        <View style={[styles.icon, dir.row]}>
          <MaterialCommunityIcons name="bookmark" size={26} color={colors.primaryGreenMid} />
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} style={styles.chevron} />
        </View>
      </View>
      <NutritionTotals totals={meal.totals} />
    </Pressable>
  );
}
