import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryRecipe } from '../types';
import { NutritionTotals } from './NutritionTotals';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = {
  recipe: PantryRecipe;
  onPress: (recipe: PantryRecipe) => void;
};

export function RecipeCard({ recipe, onPress }: Props) {
  const { t } = useTranslation('pantry');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(recipe)}
    >
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{recipe.name}</Text>
          {recipe.description ? (
            <Text style={styles.description} numberOfLines={1}>{recipe.description}</Text>
          ) : null}
          <Text style={styles.count}>
            {t('recipeDetail.itemsCount', { count: recipe.items.length })}
          </Text>
        </View>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="chef-hat" size={28} color={colors.primaryGreenMid} />
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} style={styles.chevron} />
        </View>
      </View>
      <NutritionTotals totals={recipe.totals} />
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
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
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
