import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
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
import { colors, spacing, radius } from '../../../shared/theme';

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
  const { t } = useTranslation('pantry');
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('addSavedMeal.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t('addSavedMeal.subtitle')}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('savedMeal.nameLabel')}</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            textAlign="right"
            autoFocus
          />
          {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('savedMeal.mealTypeLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealTypeRow}>
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

        <Text style={styles.sectionTitle}>{t('savedMeal.itemsSection')}</Text>

        {items.map((item) => (
          <View key={item.key} style={styles.itemRow}>
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

        <View style={styles.addButtonsRow}>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.md },
  fieldGroup: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { fontSize: 12, color: '#EF4444', marginTop: spacing.xs, textAlign: 'right' },
  mealTypeRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  mealTypeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.cardBackground,
  },
  mealTypeChipActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreenLight,
  },
  mealTypeText: { fontSize: 12, color: colors.textMuted },
  mealTypeTextActive: { color: colors.primaryGreen, fontWeight: '600' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  itemKind: { fontSize: 11, color: colors.textSecondary },
  amountInput: {
    width: 64,
    height: 36,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  unitLabel: { fontSize: 12, color: colors.textMuted },
  removeBtn: { padding: spacing.xs },
  addButtonsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  addItemBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addItemText: { fontSize: 13, fontWeight: '600', color: colors.primaryGreen },
  totalsContainer: { marginBottom: spacing.md },
  saveBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.cardBackground },
});
