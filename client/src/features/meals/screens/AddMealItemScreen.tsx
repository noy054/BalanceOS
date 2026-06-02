import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { usePantryProducts } from '../../pantry/hooks/usePantry';
import { useRecipes } from '../../pantry/hooks/useRecipes';
import { useSavedMeals } from '../../pantry/hooks/useSavedMeals';
import { useAddMealItem } from '../../day-log/hooks/useDayLog';
import { PantryProduct, PantryRecipe, SavedMeal } from '../../pantry/types';
import { colors } from '../../../shared/theme';
import { styles } from './styles/AddMealItemScreen.styles';

type Tab = 'products' | 'recipes' | 'savedMeals';

type SelectedItem =
  | { kind: 'product'; item: PantryProduct }
  | { kind: 'recipe'; item: PantryRecipe }
  | { kind: 'savedMeal'; item: SavedMeal };

const MEAL_TYPE_KEY: Record<string, string> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK_1: 'snack',
  SNACK_2: 'snack',
};

type Props = {
  mealType: string;
};

export function AddMealItemScreen({ mealType }: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [quantity, setQuantity] = useState('100');

  const { data: products = [], isLoading: loadingProducts } = usePantryProducts();
  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: savedMeals = [], isLoading: loadingSavedMeals } = useSavedMeals();

  const addMealItem = useAddMealItem();

  const mealTypeLabel = t(`mealTypes.${MEAL_TYPE_KEY[mealType] ?? 'breakfast'}`);
  const screenTitle = t('addItem.title', { mealType: mealTypeLabel });

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const filteredRecipes = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return recipes;
    return recipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, search]);

  const filteredMeals = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return savedMeals;
    return savedMeals.filter((m) => m.name.toLowerCase().includes(q));
  }, [savedMeals, search]);

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    setSelected(null);
    setSearch('');
  }

  function handleSelectProduct(item: PantryProduct) {
    setSelected({ kind: 'product', item });
    setQuantity('100');
  }

  function handleSelectRecipe(item: PantryRecipe) {
    setSelected({ kind: 'recipe', item });
    setQuantity('1');
  }

  function handleSelectSavedMeal(item: SavedMeal) {
    setSelected({ kind: 'savedMeal', item });
    setQuantity('');
  }

  async function handleLog() {
    if (!selected) return;

    const qty = parseFloat(quantity);
    if (selected.kind === 'product') {
      if (isNaN(qty) || qty <= 0) {
        Alert.alert('', t('addItem.logError'));
        return;
      }
      try {
        await addMealItem.mutateAsync({
          mealType,
          pantryProductId: selected.item.id,
          grams: qty,
        });
        router.back();
      } catch {
        Alert.alert('', t('addItem.logError'));
      }
      return;
    }

    if (selected.kind === 'recipe') {
      if (isNaN(qty) || qty <= 0) {
        Alert.alert('', t('addItem.logError'));
        return;
      }
      try {
        await addMealItem.mutateAsync({
          mealType,
          pantryRecipeId: selected.item.id,
          servings: qty,
        });
        router.back();
      } catch {
        Alert.alert('', t('addItem.logError'));
      }
      return;
    }

    // savedMeal — no quantity
    try {
      await addMealItem.mutateAsync({
        mealType,
        savedMealId: selected.item.id,
      });
      router.back();
    } catch {
      Alert.alert('', t('addItem.logError'));
    }
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'products', label: t('addItem.tabProducts') },
    { key: 'recipes', label: t('addItem.tabRecipes') },
    { key: 'savedMeals', label: t('addItem.tabSavedMeals') },
  ];

  const isLoading =
    activeTab === 'products'
      ? loadingProducts
      : activeTab === 'recipes'
        ? loadingRecipes
        : loadingSavedMeals;

  return (
    <SafeAreaView style={styles.root} edges={['top']} key={i18n.language}>
      <ScreenHeader title={screenTitle} />

      {/* Tab bar */}
      <View style={[styles.tabRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {tabs.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => handleTabPress(key)}
          >
            <Text
              style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('addItem.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            setSelected(null);
          }}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : activeTab === 'products' ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('addItem.noProducts')}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected =
              selected?.kind === 'product' && selected.item.id === item.id;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                  pressed && styles.itemCardPressed,
                ]}
                onPress={() => handleSelectProduct(item)}
              >
                <Text
                  style={[styles.itemName, { textAlign: isRTL ? 'right' : 'left' }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.brand ? (
                  <Text
                    style={[styles.itemSub, { textAlign: isRTL ? 'right' : 'left' }]}
                    numberOfLines={1}
                  >
                    {item.brand}
                  </Text>
                ) : null}
                <Text
                  style={[styles.itemMacros, { textAlign: isRTL ? 'right' : 'left' }]}
                >
                  {item.caloriesPer100g} kcal · {item.proteinPer100g}g P · {item.carbsPer100g}g C · {item.fatPer100g}g F
                </Text>
              </Pressable>
            );
          }}
        />
      ) : activeTab === 'recipes' ? (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(r) => r.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('addItem.noRecipes')}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected =
              selected?.kind === 'recipe' && selected.item.id === item.id;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                  pressed && styles.itemCardPressed,
                ]}
                onPress={() => handleSelectRecipe(item)}
              >
                <Text
                  style={[styles.itemName, { textAlign: isRTL ? 'right' : 'left' }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.itemMacros, { textAlign: isRTL ? 'right' : 'left' }]}
                >
                  {item.totals.calories} kcal · {item.totals.protein}g P · {item.totals.carbs}g C · {item.totals.fat}g F
                </Text>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(m) => m.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('addItem.noSavedMeals')}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected =
              selected?.kind === 'savedMeal' && selected.item.id === item.id;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                  pressed && styles.itemCardPressed,
                ]}
                onPress={() => handleSelectSavedMeal(item)}
              >
                <Text
                  style={[styles.itemName, { textAlign: isRTL ? 'right' : 'left' }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.itemMacros, { textAlign: isRTL ? 'right' : 'left' }]}
                >
                  {item.totals.calories} kcal · {item.totals.protein}g P · {item.totals.carbs}g C · {item.totals.fat}g F
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      {/* Log panel — shown when an item is selected */}
      {selected ? (
        <View style={styles.logPanel}>
          <Text
            style={[styles.logPanelTitle, { textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={1}
          >
            {selected.item.name}
          </Text>

          {selected.kind === 'product' || selected.kind === 'recipe' ? (
            <View
              style={[
                styles.quantityRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={styles.quantityLabel}>
                {selected.kind === 'product'
                  ? t('addItem.gramsLabel')
                  : t('addItem.servingsLabel')}
              </Text>
              <TextInput
                style={[styles.quantityInput, { textAlign: isRTL ? 'right' : 'left' }]}
                keyboardType="decimal-pad"
                value={quantity}
                onChangeText={setQuantity}
                selectTextOnFocus
              />
            </View>
          ) : (
            <Text style={[styles.logPanelSub, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('addItem.wholeMeal')}
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.logBtn,
              addMealItem.isPending && styles.logBtnDisabled,
              pressed && styles.logBtnPressed,
            ]}
            onPress={handleLog}
            disabled={addMealItem.isPending}
          >
            <Text style={styles.logBtnText}>
              {addMealItem.isPending ? t('addItem.logging') : t('addItem.logButton')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
