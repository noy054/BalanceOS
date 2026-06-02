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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { usePantryProducts } from '../../pantry/hooks/usePantry';
import { useRecipes } from '../../pantry/hooks/useRecipes';
import { useSavedMeals } from '../../pantry/hooks/useSavedMeals';
import { useAddMealItem } from '../../day-log/hooks/useDayLog';
import { PantryProduct, PantryRecipe, SavedMeal } from '../../pantry/types';
import { AddMealItemPayload } from '../../day-log/types';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { colors } from '../../../shared/theme';
import { styles } from './styles/AddMealItemScreen.styles';

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
  SNACK_2: 'snack',
};

function isSnack(mt: string) {
  return mt === 'SNACK_1' || mt === 'SNACK_2';
}

type Props = {
  /** When provided (tapped from a shortcut), locks to that meal type.
   *  When absent (opened from the + button), shows a meal-type picker. */
  mealType?: string;
};

export function AddMealItemScreen({ mealType: mealTypeProp }: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  const isGeneralMode = !mealTypeProp;
  const [activeMealType, setActiveMealType] = useState<string>(mealTypeProp ?? '');

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: products = [], isLoading: loadingProducts } = usePantryProducts();
  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: savedMeals = [], isLoading: loadingSavedMeals } = useSavedMeals();

  const addMealItem = useAddMealItem();

  const mealTypeLabel = MEAL_TYPE_KEY[activeMealType]
    ? t(`mealTypes.${MEAL_TYPE_KEY[activeMealType]}`)
    : '';

  const screenTitle = activeMealType
    ? t('addItem.title', { mealType: mealTypeLabel })
    : t('addItem.titleGeneral');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const filteredRecipes = useMemo(() => {
    const q = search.toLowerCase().trim();
    // Category filter: show recipes matching the active meal type or uncategorized
    const base = recipes.filter((r) => {
      if (!r.mealType) return true;
      if (isSnack(activeMealType) && isSnack(r.mealType)) return true;
      return r.mealType === activeMealType;
    });
    if (!q) return base;
    return base.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, search, activeMealType]);

  const filteredMeals = useMemo(() => {
    const q = search.toLowerCase().trim();
    // Category filter: show meals matching the active type or uncategorized
    const base = savedMeals.filter((m) => {
      if (!m.mealType) return true;
      if (isSnack(activeMealType) && isSnack(m.mealType)) return true;
      return m.mealType === activeMealType;
    });
    if (!q) return base;
    return base.filter((m) => m.name.toLowerCase().includes(q));
  }, [savedMeals, search, activeMealType]);

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  function handleAddToCart() {
    if (!selected || !activeMealType) return;

    const qty = parseFloat(quantity);
    if (selected.kind !== 'savedMeal' && (isNaN(qty) || qty <= 0)) {
      Alert.alert('', t('addItem.logError'));
      return;
    }

    const payload: AddMealItemPayload = { mealType: activeMealType };
    let qtyLabel = '';

    if (selected.kind === 'product') {
      payload.pantryProductId = selected.item.id;
      payload.grams = qty;
      qtyLabel = `${qty}g`;
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

  function renderItem({ item }: { item: PantryProduct | PantryRecipe | SavedMeal }) {
    let isSelected = false;
    let sub: string | null = null;
    let macros = '';

    if (activeTab === 'products') {
      const p = item as PantryProduct;
      isSelected = selected?.kind === 'product' && selected.item.id === p.id;
      sub = p.brand ?? null;
      macros = `${p.caloriesPer100g} kcal · ${p.proteinPer100g}g P · ${p.carbsPer100g}g C · ${p.fatPer100g}g F`;
    } else if (activeTab === 'recipes') {
      const r = item as PantryRecipe;
      isSelected = selected?.kind === 'recipe' && selected.item.id === r.id;
      macros = `${r.totals.calories} kcal · ${r.totals.protein}g P · ${r.totals.carbs}g C · ${r.totals.fat}g F`;
    } else {
      const m = item as SavedMeal;
      isSelected = selected?.kind === 'savedMeal' && selected.item.id === m.id;
      macros = `${m.totals.calories} kcal · ${m.totals.protein}g P · ${m.totals.carbs}g C · ${m.totals.fat}g F`;
    }

    function onPress() {
      if (activeTab === 'products') handleSelectProduct(item as PantryProduct);
      else if (activeTab === 'recipes') handleSelectRecipe(item as PantryRecipe);
      else handleSelectSavedMeal(item as SavedMeal);
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemCard,
          isSelected && styles.itemCardSelected,
          pressed && styles.itemCardPressed,
        ]}
        onPress={onPress}
      >
        <Text style={[styles.itemName, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
          {item.name}
        </Text>
        {sub ? (
          <Text style={[styles.itemSub, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
        <Text style={[styles.itemMacros, { textAlign: isRTL ? 'right' : 'left' }]}>
          {macros}
        </Text>
      </Pressable>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root} edges={['top']} key={i18n.language}>
      <ScreenHeader
        title={screenTitle}
        rightElement={
          <Pressable onPress={() => router.back()} hitSlop={14}>
            <Text style={styles.doneBtn}>{t('addItem.done')}</Text>
          </Pressable>
        }
      />

      {/* Meal type picker — only shown in general mode (opened from + button) */}
      {isGeneralMode ? (
        <View style={[styles.mealTypeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {MEAL_SHORTCUTS.map((s) => {
            const isActive = activeMealType === s.type;
            return (
              <Pressable
                key={s.type}
                style={[styles.mealTypeBtn, isActive && styles.mealTypeBtnActive]}
                onPress={() => {
                  setActiveMealType(s.type);
                  setSelected(null);
                }}
              >
                <Text style={[styles.mealTypeBtnLabel, isActive && styles.mealTypeBtnLabelActive]}>
                  {t(`mealTypes.${s.labelKey}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* Tab bar */}
      <View style={[styles.tabRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {tabs.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => handleTabPress(key)}
          >
            <Text style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}>
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

      {/* Empty state when general mode and no meal type selected yet */}
      {isGeneralMode && !activeMealType ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { textAlign: 'center' }]}>
            {t('addItem.chooseMealType')}
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <FlatList
          data={listData as (PantryProduct | PantryRecipe | SavedMeal)[]}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t(emptyKey as Parameters<typeof t>[0])}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Cart — items queued to save */}
      {cart.length > 0 ? (
        <View style={styles.cartSection}>
          <Text style={[styles.cartHeader, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('addItem.cartItems', { count: cart.length })}
          </Text>
          {cart.map((entry) => (
            <View key={entry.key} style={[styles.cartRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.cartItemName, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                {entry.name}
              </Text>
              <Text style={styles.cartItemQty}>{entry.qtyLabel}</Text>
              <Pressable style={styles.cartRemoveBtn} onPress={() => removeCartEntry(entry.key)} hitSlop={8}>
                <MaterialCommunityIcons name="close" size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

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
            <View style={[styles.quantityRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
              !activeMealType && styles.logBtnDisabled,
              pressed && styles.logBtnPressed,
            ]}
            onPress={handleAddToCart}
            disabled={!activeMealType}
          >
            <Text style={styles.logBtnText}>{t('addItem.addToList')}</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Save footer — shown when cart has items */}
      {cart.length > 0 ? (
        <View style={styles.saveFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              isSaving && styles.saveBtnDisabled,
              pressed && styles.saveBtnPressed,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveBtnText}>
              {isSaving
                ? t('addItem.saving')
                : t('addItem.saveButton', { mealType: mealTypeLabel })}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
