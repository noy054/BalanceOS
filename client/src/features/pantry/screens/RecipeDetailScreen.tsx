import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useRecipe, useDeleteRecipe } from '../hooks/useRecipes';
import { NutritionTotals } from '../components/NutritionTotals';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { colors, spacing } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/RecipeDetailScreen.styles';

type Props = { id: string };

export function RecipeDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const { data: recipe, isLoading } = useRecipe(id);
  const deleteRecipe = useDeleteRecipe();

  function handleDelete() {
    Alert.alert(
      t('recipe.deleteConfirmTitle'),
      t('recipe.deleteConfirmMessage'),
      [
        { text: t('recipe.deleteConfirmNo'), style: 'cancel' },
        {
          text: t('recipe.deleteConfirmYes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe.mutateAsync(id);
              router.back();
            } catch {
              Alert.alert('', t('errors.deleteRecipeFailed'));
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('errors.loadRecipesFailed')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const deleteBtn = (
    <Pressable onPress={handleDelete} hitSlop={12} style={styles.deleteBtn}>
      <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={recipe.name} rightElement={deleteBtn} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {recipe.description ? (
          <Text style={[{ fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md }, dir.text]}>
            {recipe.description}
          </Text>
        ) : null}

        <Text style={[{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }, dir.text]}>
          {t('recipeDetail.totalsSection')}
        </Text>
        <View style={styles.card}>
          <NutritionTotals totals={recipe.totals} variant="highlight" />
        </View>

        <Text style={[{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }, dir.text]}>
          {t('recipeDetail.ingredientsSection')}
        </Text>
        <View style={styles.card}>
          {recipe.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.ingredientRow, dir.row, index < recipe.items.length - 1 && styles.rowBorder]}
            >
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{item.product.name}</Text>
                {item.product.brand ? (
                  <Text style={styles.ingredientBrand}>{item.product.brand}</Text>
                ) : null}
                <Text style={styles.ingredientGrams}>{item.grams} {t('recipe.gramsLabel')}</Text>
              </View>
              <View style={styles.ingredientNutrition}>
                <Text style={styles.ingredientCals}>
                  {item.nutrition.calories} {t('product.calUnit')}
                </Text>
                <Text style={styles.ingredientMacros}>
                  {t('macros.protein')} {item.nutrition.protein}{t('product.gramsUnit')}
                  {'  '}{t('macros.carbs')} {item.nutrition.carbs}{t('product.gramsUnit')}
                  {'  '}{t('macros.fat')} {item.nutrition.fat}{t('product.gramsUnit')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
