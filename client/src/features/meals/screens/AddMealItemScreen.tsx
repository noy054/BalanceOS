import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { Button } from '../../../shared/components/ui/Button';
import { IconButton } from '../../../shared/components/ui/IconButton';
import { SearchField } from '../../../shared/components/ui/SearchField';
import { SegmentedControl } from '../../../shared/components/ui/SegmentedControl';
import { StateView } from '../../../shared/components/ui/StateView';
import { usePantryProducts } from '../../pantry/hooks/usePantry';
import { useRecipes } from '../../pantry/hooks/useRecipes';
import { useSavedMeals } from '../../pantry/hooks/useSavedMeals';
import { useAddMealItem } from '../../day-log/hooks/useDayLog';
import { PantryProduct, PantryRecipe, ProductCategory, SavedMeal } from '../../pantry/types';
import { AddMealItemPayload } from '../../day-log/types';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { FoodItemCard } from '../../pantry/components/food/FoodItemCard';
import { useFoodCardModels } from '../../pantry/hooks/useFoodCardModels';
import { PANTRY_QUERY_KEYS } from '../../pantry/constants';
import { useMealReturn } from '../../pantry/mealReturnStore';
import { sortByMealCategory } from '../../pantry/helpers/sortByMealCategory';
import { useAppTheme } from '../../../shared/theme';
import { useStyles } from './styles/AddMealItemScreen.styles';
import { ListGap } from '../../../shared/components/ui/ListGap';
import { useDirection } from '../../../shared/hooks/useDirection';

type Tab = 'products' | 'recipes' | 'savedMeals';

type SelectedItem =
  | { kind: 'product'; item: PantryProduct }
  | { kind: 'recipe'; item: PantryRecipe }
  | { kind: 'savedMeal'; item: SavedMeal };

type CartEntry = {
  key: string;
  name: string;
  qtyLabel: string;
  payload: AddMealItemPayload;
};

const MEAL_TYPE_KEY: Record<string, string> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK_1: 'snack',
  SNACK_2: 'snack2',
};

function isSnack(mt: string) {
  return mt === 'SNACK_1' || mt === 'SNACK_2';
}

function mealTypeToCategory(mealType: string): ProductCategory | null {
  if (mealType === 'BREAKFAST') return 'BREAKFAST';
  if (mealType === 'LUNCH') return 'LUNCH';
  if (mealType === 'DINNER') return 'DINNER';
  if (isSnack(mealType)) return 'SNACK';
  return null;
}

type Props = {
  /** When provided (tapped from a shortcut), locks to that meal type.
   *  When absent (opened from the + button), shows a meal-type picker. */
  mealType?: string;
};

export function AddMealItemScreen({ mealType: mealTypeProp }: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const { colors } = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const models = useFoodCardModels();
  const dir = useDirection();

  const isGeneralMode = !mealTypeProp;
  const [activeMealType, setActiveMealType] = useState<string>(mealTypeProp ?? '');

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading: loadingProducts,
    loadMore: loadMoreProducts,
  } = usePantryProducts(search);
  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: savedMeals = [], isLoading: loadingSavedMeals } = useSavedMeals();

  const addMealItem = useAddMealItem();

  useFocusEffect(
    useCallback(() => {
      const pending = useMealReturn.getState().pendingProduct;
      if (!pending) return;
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list });
      setActiveTab('products');
      setSelected({ kind: 'product', item: pending });
      setQuantity(pending.servingSizeG ? '1' : '100');
      useMealReturn.getState().clearPending();
    }, [queryClient]),
  );

  const mealTypeLabel = MEAL_TYPE_KEY[activeMealType]
    ? t(`mealTypes.${MEAL_TYPE_KEY[activeMealType]}`)
    : '';

  const screenTitle = activeMealType
    ? t('addItem.title', { mealType: mealTypeLabel })
    : t('addItem.titleGeneral');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    const matchCat = mealTypeToCategory(activeMealType);
    return sortByMealCategory(products, matchCat);
  }, [products, activeMealType]);

  const filteredRecipes = useMemo(() => {
    const q = search.toLowerCase().trim();

    let base = recipes;
    if (activeMealType) {
      base = recipes.filter((r) => {
        if (!r.mealType) return true;
        if (isSnack(activeMealType) && isSnack(r.mealType)) return true;
        return r.mealType === activeMealType;
      });
    }

    if (!q) return base;
    return base.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, search, activeMealType]);

  const filteredMeals = useMemo(() => {
    const q = search.toLowerCase().trim();

    let base = savedMeals;
    if (activeMealType) {
      base = savedMeals.filter((m) => {
        if (!m.mealType) return true;
        if (isSnack(activeMealType) && isSnack(m.mealType)) return true;
        return m.mealType === activeMealType;
      });
    }

    if (!q) return base;
    return base.filter((m) => m.name.toLowerCase().includes(q));
  }, [savedMeals, search, activeMealType]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    setSelected(null);
    setSearch('');
  }

  function handleMealTypeChange(nextMealType: string) {
    setActiveMealType(nextMealType);
    // Keep selection if it's an uncategorized product — it's valid for any meal type
    const isUncategorizedProduct =
      selected?.kind === 'product' &&
      (selected.item.mealCategories ?? []).length === 0;
    if (!isUncategorizedProduct) {
      setSelected(null);
    }
  }

  function handleSelectProduct(item: PantryProduct) {
    setSelected({ kind: 'product', item });
    setQuantity(item.servingSizeG ? '1' : '100');
  }

  function handleSelectRecipe(item: PantryRecipe) {
    setSelected({ kind: 'recipe', item });
    setQuantity('1');
  }

  function handleSelectSavedMeal(item: SavedMeal) {
    setSelected({ kind: 'savedMeal', item });
    setQuantity('');
  }

  function handleAddToCart() {
    if (!selected) return;
    if (!activeMealType) {
      Alert.alert('', t('addItem.chooseMealType'));
      return;
    }

    const qty = parseFloat(quantity);
    if (selected.kind !== 'savedMeal' && (isNaN(qty) || qty <= 0)) {
      Alert.alert('', t('addItem.logError'));
      return;
    }

    const payload: AddMealItemPayload = { mealType: activeMealType };
    let qtyLabel = '';

    if (selected.kind === 'product') {
      payload.pantryProductId = selected.item.id;
      const servingSize = selected.item.servingSizeG;
      if (servingSize) {
        payload.grams = qty * servingSize;
        qtyLabel = `×${qty}`;
      } else {
        payload.grams = qty;
        qtyLabel = `${qty} ${t('addItem.units.grams')}`;
      }
    } else if (selected.kind === 'recipe') {
      payload.pantryRecipeId = selected.item.id;
      payload.servings = qty;
      qtyLabel = `×${qty}`;
    } else {
      payload.savedMealId = selected.item.id;
      qtyLabel = t('addItem.wholeMeal');
    }

    setCart((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).slice(2),
        name: selected.item.name,
        qtyLabel,
        payload,
      },
    ]);
    setSelected(null);
    setQuantity('100');
  }

  async function handleSave() {
    if (cart.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      for (const entry of cart) {
        await addMealItem.mutateAsync(entry.payload);
      }
      router.back();
    } catch {
      Alert.alert('', t('addItem.logError'));
      setIsSaving(false);
    }
  }

  function removeCartEntry(key: string) {
    setCart((prev) => prev.filter((e) => e.key !== key));
  }

  // ── Sub-components ─────────────────────────────────────────────────────────

  const tabs: Array<{ value: Tab; label: string }> = [
    { value: 'products', label: t('addItem.tabProducts') },
    { value: 'recipes', label: t('addItem.tabRecipes') },
    { value: 'savedMeals', label: t('addItem.tabSavedMeals') },
  ];

  const mealTypeOptions = MEAL_SHORTCUTS.map((s) => ({
    value: s.type as string,
    label: t(`mealTypes.${s.labelKey}`),
  }));

  const isLoading =
    activeTab === 'products'
      ? loadingProducts
      : activeTab === 'recipes'
        ? loadingRecipes
        : loadingSavedMeals;

  const listData =
    activeTab === 'products'
      ? filteredProducts
      : activeTab === 'recipes'
        ? filteredRecipes
        : filteredMeals;

  const emptyKey =
    activeTab === 'products'
      ? 'addItem.noProducts'
      : activeTab === 'recipes'
        ? 'addItem.noRecipes'
        : 'addItem.noSavedMeals';

  const searchPlaceholder =
    activeTab === 'products'
      ? t('addItem.searchProducts')
      : activeTab === 'recipes'
        ? t('addItem.searchRecipes')
        : t('addItem.searchSavedMeals');

  function renderSelectionMark(isSelected: boolean) {
    return (
      <View style={[styles.radio, isSelected && styles.radioActive]}>
        {isSelected ? (
          <MaterialCommunityIcons name="check" size={14} color={colors.onAccent} />
        ) : null}
      </View>
    );
  }

  function renderItem({ item }: { item: PantryProduct | PantryRecipe | SavedMeal }) {
    if (activeTab === 'products') {
      const p = item as PantryProduct;
      const isSelected = selected?.kind === 'product' && selected.item.id === p.id;
      return (
        <FoodItemCard
          {...models.product(p)}
          selected={isSelected}
          onPress={() => handleSelectProduct(p)}
          trailing={renderSelectionMark(isSelected)}
        />
      );
    }

    if (activeTab === 'recipes') {
      const r = item as PantryRecipe;
      const isSelected = selected?.kind === 'recipe' && selected.item.id === r.id;
      return (
        <FoodItemCard
          {...models.recipe(r)}
          selected={isSelected}
          onPress={() => handleSelectRecipe(r)}
          trailing={renderSelectionMark(isSelected)}
        />
      );
    }

    const m = item as SavedMeal;
    const isSelected = selected?.kind === 'savedMeal' && selected.item.id === m.id;
    return (
      <FoodItemCard
        {...models.savedMeal(m)}
        selected={isSelected}
        onPress={() => handleSelectSavedMeal(m)}
        trailing={renderSelectionMark(isSelected)}
      />
    );
  }

  const quantityLabel =
    selected?.kind === 'product'
      ? (selected.item.servingSizeG ? t('addItem.servingsLabel') : t('addItem.gramsLabel'))
      : t('addItem.servingsLabel');

  const showDock = Boolean(selected) || cart.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root} edges={['top']} key={i18n.language}>
      <ScreenHeader
        title={screenTitle}
        rightElement={
          <Button
            label={t('addItem.done')}
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
          />
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.controls}>
          {isGeneralMode ? (
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, dir.text]}>
                {t('addItem.mealLabel')}
              </Text>
              <SegmentedControl
                options={mealTypeOptions}
                value={activeMealType || null}
                onChange={handleMealTypeChange}
                onDeselect={() => handleMealTypeChange('')}
              />
            </View>
          ) : null}

          <SegmentedControl options={tabs} value={activeTab} onChange={handleTabPress} />

          <SearchField
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setSelected(null);
            }}
            placeholder={searchPlaceholder}
            trailing={
              activeTab === 'products' ? (
                <IconButton
                  icon="barcode-scan"
                  variant="tonal"
                  size={44}
                  accessibilityLabel={t('addItem.scanBarcode')}
                  onPress={() => router.push('/(app)/pantry/barcode?returnTo=meal')}
                />
              ) : null
            }
          />
        </View>

        {isLoading ? (
          <StateView variant="loading" />
        ) : (
          <FlatList
            data={listData as (PantryProduct | PantryRecipe | SavedMeal)[]}
            keyExtractor={(item) => item.id}
            style={styles.flex}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            onEndReached={activeTab === 'products' ? loadMoreProducts : undefined}
            onEndReachedThreshold={0.5}
            ItemSeparatorComponent={ListGap}
            ListEmptyComponent={
              <StateView
                variant="empty"
                compact
                icon={search.trim() ? 'magnify' : 'tray'}
                title={t(emptyKey as Parameters<typeof t>[0])}
              />
            }
            renderItem={renderItem}
          />
        )}

        {showDock ? (
          <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {cart.length > 0 ? (
              <View style={styles.cartSection}>
                <Text style={[styles.dockLabel, dir.text]}>
                  {t('addItem.cartItems', { count: cart.length })}
                </Text>

                <ScrollView
                  style={styles.cartScroll}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {cart.map((entry) => (
                    <View key={entry.key} style={[styles.cartRow, dir.row]}>
                      <Text style={[styles.cartItemName, dir.text]} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      <Text style={styles.cartItemQty}>{entry.qtyLabel}</Text>
                      <IconButton
                        icon="close"
                        size={32}
                        iconSize={16}
                        accessibilityLabel={t('addItem.removeFromList', { name: entry.name })}
                        onPress={() => removeCartEntry(entry.key)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {selected ? (
              <View style={styles.selectionSection}>
                <Text style={[styles.selectionName, dir.text]} numberOfLines={1}>
                  {selected.item.name}
                </Text>

                <View style={[styles.selectionRow, dir.row]}>
                  {selected.kind === 'product' || selected.kind === 'recipe' ? (
                    <View style={[styles.quantityField, dir.row]}>
                      <TextInput
                        style={styles.quantityInput}
                        keyboardType="decimal-pad"
                        value={quantity}
                        onChangeText={setQuantity}
                        selectTextOnFocus
                        textAlign="center"
                        accessibilityLabel={quantityLabel}
                      />
                      <Text style={styles.quantityUnit}>{quantityLabel}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.wholeMeal, dir.text]}>
                      {t('addItem.wholeMeal')}
                    </Text>
                  )}

                  <Button
                    label={t('addItem.addToList')}
                    icon="plus"
                    variant={cart.length > 0 ? 'tonal' : 'primary'}
                    onPress={handleAddToCart}
                    style={styles.addToListButton}
                  />
                </View>
              </View>
            ) : null}

            {cart.length > 0 ? (
              <Button
                label={
                  isSaving
                    ? t('addItem.saving')
                    : t('addItem.saveButton', { mealType: mealTypeLabel })
                }
                onPress={handleSave}
                loading={isSaving}
                fullWidth
              />
            ) : null}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
