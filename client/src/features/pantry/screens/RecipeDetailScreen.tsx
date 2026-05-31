import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useRecipe, useDeleteRecipe } from '../hooks/useRecipes';
import { NutritionTotals } from '../components/NutritionTotals';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = { id: string };

export function RecipeDetailScreen({ id }: Props) {
  const { t } = useTranslation('pantry');
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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        <Pressable onPress={handleDelete} hitSlop={12} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {recipe.description ? (
          <Text style={styles.description}>{recipe.description}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>{t('recipeDetail.totalsSection')}</Text>
        <View style={styles.card}>
          <NutritionTotals totals={recipe.totals} variant="highlight" />
        </View>

        <Text style={styles.sectionTitle}>{t('recipeDetail.ingredientsSection')}</Text>
        <View style={styles.card}>
          {recipe.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.ingredientRow, index < recipe.items.length - 1 && styles.rowBorder]}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: colors.textMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  deleteBtn: { padding: spacing.xs },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    ...cardShadow,
    overflow: 'hidden',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  ingredientInfo: { flex: 1 },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  ingredientBrand: { fontSize: 11, color: colors.textSecondary },
  ingredientGrams: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  ingredientNutrition: { alignItems: 'flex-end' },
  ingredientCals: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  ingredientMacros: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
