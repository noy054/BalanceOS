import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryRecipe } from '../types';
import { NutritionTotals } from './NutritionTotals';
import { colors, spacing } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/RecipeCard.styles';

type Props = {
  recipe: PantryRecipe;
  onPress: (recipe: PantryRecipe) => void;
};

export function RecipeCard({ recipe, onPress }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(recipe)}
    >
      <View style={[styles.topRow, dir.row]}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{recipe.name}</Text>
          {recipe.description ? (
            <Text style={styles.description} numberOfLines={1}>{recipe.description}</Text>
          ) : null}
          <Text style={styles.count}>
            {t('recipeDetail.itemsCount', { count: recipe.items.length })}
          </Text>
        </View>
        <View style={[styles.icon, dir.row]}>
          <MaterialCommunityIcons name="chef-hat" size={28} color={colors.primaryGreenMid} />
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} style={styles.chevron} />
        </View>
      </View>
      <NutritionTotals totals={recipe.totals} />
    </Pressable>
  );
}
