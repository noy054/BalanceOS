import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useCreateSavedMeal } from '../hooks/useSavedMeals';
import { usePantryProducts } from '../hooks/usePantry';
import { useRecipes } from '../hooks/useRecipes';
import { ProductPickerModal, RecipePickerModal } from '../components/ProductPickerModal';
import { NutritionTotals } from '../components/NutritionTotals';
import { calcProductNutrition, sumNutrition } from '../helpers/nutrition';
import { MealType, NutritionTotals as NutritionTotalsType, PantryProduct, PantryRecipe } from '../types';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/AddSavedMealScreen.styles';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_1', 'SNACK_2'];

type ProductItem = { kind: 'product'; key: string; product: PantryProduct; grams: string };
type RecipeItem = { kind: 'recipe'; key: string; recipe: PantryRecipe; servings: string };
type DraftItem = ProductItem | RecipeItem;

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function calcRecipeTotals(recipe: PantryRecipe, servings: number): NutritionTotalsType {
  const s = servings;
  return {
    calories: Math.round(recipe.totals.calories * s),
    protein: Math.round(recipe.totals.protein * s * 10) / 10,
    carbs: Math.round(recipe.totals.carbs * s * 10) / 10,
    fat: Math.round(recipe.totals.fat * s * 10) / 10,
    fiber: Math.round(recipe.totals.fiber * s * 10) / 10,
  };
}

export function AddSavedMealScreen() {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const createSavedMeal = useCreateSavedMeal();
  const { data: products = [] } = usePantryProducts();
  const { data: recipes = [] } = useRecipes();

  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [recipePickerVisible, setRecipePickerVisible] = useState(false);
  const [nameError, setNameError] = useState('');

  const liveTotals = useMemo(() => {
    const nutritionList: NutritionTotalsType[] = items
      .map((item) => {
        if (item.kind === 'product') {
          const g = parseFloat(item.grams);
          if (!isNaN(g) && g > 0) return calcProductNutrition(item.product, g);
        } else {
          const s = parseFloat(item.servings);
          if (!isNaN(s) && s > 0) return calcRecipeTotals(item.recipe, s);
        }
        return null;
      })
      .filter((n): n is NutritionTotalsType => n !== null);
    return sumNutrition(nutritionList);
  }, [items]);

  function addProduct(product: PantryProduct) {
    setItems((prev) => [...prev, { kind: 'product', key: makeKey(), product, grams: '' }]);
    setProductPickerVisible(false);
  }

  function addRecipe(recipe: PantryRecipe) {
    setItems((prev) => [...prev, { kind: 'recipe', key: makeKey(), recipe, servings: '1' }]);
    setRecipePickerVisible(false);
  }

  function updateAmount(key: string, value: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? item.kind === 'product'
            ? { ...item, grams: value }
            : { ...item, servings: value }
          : item,
      ),
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError(t('errors.requiredField'));
      return;
    }
    if (items.length === 0) {
      Alert.alert('', t('errors.noItems'));
      return;
    }

    const validItems = items
      .map((item) => {
        if (item.kind === 'product') {
          const g = parseFloat(item.grams);
          if (!isNaN(g) && g > 0) return { productId: item.product.id, grams: g };
        } else {
          const s = parseFloat(item.servings);
          if (!isNaN(s) && s > 0) return { recipeId: item.recipe.id, servings: s };
        }
        return null;
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    if (validItems.length === 0) {
      Alert.alert('', t('errors.noItems'));
      return;
    }

    try {
      await createSavedMeal.mutateAsync({
        name: name.trim(),
        mealType: mealType ?? undefined,
        items: validItems,
      });
      router.back();
    } catch {
      Alert.alert('', t('errors.saveSavedMealFailed'));
    }
  }

  const hasTotals = liveTotals.calories > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('addSavedMeal.title')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }, dir.text]}>
          {t('addSavedMeal.subtitle')}
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }, dir.text]}>
            {t('savedMeal.nameLabel')}
          </Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            textAlign={isRTL ? 'right' : 'left'}
            autoFocus
          />
          {nameError ? (
            <Text style={[{ fontSize: 12, color: colors.danger, marginTop: 4 }, dir.text]}>{nameError}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }, dir.text]}>
            {t('savedMeal.mealTypeLabel')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.mealTypeRow, dir.row]}>
            {MEAL_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[styles.mealTypeChip, mealType === type && styles.mealTypeChipActive]}
                onPress={() => setMealType(mealType === type ? null : type)}
              >
                <Text style={[styles.mealTypeText, mealType === type && styles.mealTypeTextActive]}>
                  {t(`mealTypes.${type}` as Parameters<typeof t>[0])}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Text style={[{
          fontSize: 14,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: 8,
          marginTop: 4,
          paddingBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }, dir.text]}>
          {t('savedMeal.itemsSection')}
        </Text>

        {items.map((item) => (
          <View key={item.key} style={[styles.itemRow, dir.row]}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.kind === 'product' ? item.product.name : item.recipe.name}
              </Text>
              <Text style={styles.itemKind}>
                {item.kind === 'product'
                  ? (item.product.brand ?? `${item.product.caloriesPer100g} ${t('product.calUnit')}/100${t('product.gramsUnit')}`)
                  : `${item.recipe.totals.calories} ${t('product.calUnit')} / ${t('savedMeal.servingsLabel')}`}
              </Text>
            </View>
            <TextInput
              style={styles.amountInput}
              value={item.kind === 'product' ? item.grams : item.servings}
              onChangeText={(v) => updateAmount(item.key, v)}
              keyboardType="decimal-pad"
              placeholder={item.kind === 'product' ? t('savedMeal.gramsPlaceholder') : t('savedMeal.servingsPlaceholder')}
              placeholderTextColor={colors.textMuted}
              textAlign="center"
            />
            <Text style={styles.unitLabel}>
              {item.kind === 'product' ? t('savedMeal.gramsLabel') : t('savedMeal.servingsLabel')}
            </Text>
            <Pressable onPress={() => removeItem(item.key)} hitSlop={8} style={styles.removeBtn}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}

        <View style={[styles.addButtonsRow, dir.row]}>
          <Pressable style={styles.addItemBtn} onPress={() => setProductPickerVisible(true)}>
            <Text style={styles.addItemText}>{t('savedMeal.addProductItem')}</Text>
          </Pressable>
          <Pressable style={styles.addItemBtn} onPress={() => setRecipePickerVisible(true)}>
            <Text style={styles.addItemText}>{t('savedMeal.addRecipeItem')}</Text>
          </Pressable>
        </View>

        {hasTotals ? (
          <View style={styles.totalsContainer}>
            <NutritionTotals totals={liveTotals} label={t('savedMeal.totalsSection')} variant="highlight" />
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={createSavedMeal.isPending}
        >
          <Text style={styles.saveBtnText}>
            {createSavedMeal.isPending ? t('savedMeal.saving') : t('savedMeal.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>

      <ProductPickerModal
        visible={productPickerVisible}
        products={products}
        onSelect={addProduct}
        onClose={() => setProductPickerVisible(false)}
      />
      <RecipePickerModal
        visible={recipePickerVisible}
        recipes={recipes}
        onSelect={addRecipe}
        onClose={() => setRecipePickerVisible(false)}
      />
    </SafeAreaView>
  );
}
