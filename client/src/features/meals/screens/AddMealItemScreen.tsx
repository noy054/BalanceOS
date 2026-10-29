import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { Button } from '../../../shared/components/ui/Button';
import { IconButton } from '../../../shared/components/ui/IconButton';
import { SearchField } from '../../../shared/components/ui/SearchField';
import { SegmentedControl } from '../../../shared/components/ui/SegmentedControl';
import { StateView } from '../../../shared/components/ui/StateView';
import { ListGap } from '../../../shared/components/ui/ListGap';
import { isAmbiguousName, useDuplicateNames } from '../../pantry/helpers/duplicateNames';
import { KeyboardAvoider } from '../../../shared/components/ui/KeyboardAvoider';
import { usePantryProducts } from '../../pantry/hooks/usePantry';
import { useRecipes } from '../../pantry/hooks/useRecipes';
import { useSavedMeals } from '../../pantry/hooks/useSavedMeals';
import { PartialAddMealItemsError, useAddMealItems } from '../../day-log/hooks/useDayLog';
import { PantryProduct, PantryRecipe, ProductCategory, SavedMeal } from '../../pantry/types';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { FoodItemCard } from '../../pantry/components/food/FoodItemCard';
import { useFoodCardModels } from '../../pantry/hooks/useFoodCardModels';
import { useMealReturn } from '../../pantry/mealReturnStore';
import { sortByMealCategory } from '../../pantry/helpers/sortByMealCategory';
import { useServingFormat } from '../../pantry/hooks/useServingFormat';
import { useDirection } from '../../../shared/hooks/useDirection';
import { formatCalories } from '../../../shared/helpers/formatNumber';
import { DateKey } from '../../../shared/helpers/dateKey';
import { useSelectedDate } from '../../day-log/hooks/useSelectedDate';
import { useDayLabels } from '../../day-log/hooks/useDayLabels';
import { SelectionPanel } from '../components/SelectionPanel';
import { MealCartEntry, SelectedAmount, useMealSelection } from '../hooks/useMealSelection';
import { useStyles } from './styles/AddMealItemScreen.styles';

type Tab = 'products' | 'recipes' | 'savedMeals';

type ListItem = PantryProduct | PantryRecipe | SavedMeal;

const DOCK_MIN_BOTTOM = 12;

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

function matchesMealType<T extends { mealType: string | null }>(items: T[], mealType: string) {
  if (!mealType) return items;
  return items.filter((item) => {
    if (!item.mealType) return true;
    if (isSnack(mealType) && isSnack(item.mealType)) return true;
    return item.mealType === mealType;
  });
}

function matchesSearch<T extends { name: string }>(items: T[], search: string) {
  const q = search.toLowerCase().trim();
  return q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;
}

type Props = {
  mealType?: string;
  date?: DateKey;
};

export function AddMealItemScreen({ mealType: mealTypeProp, date: dateProp }: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const selectedDate = useSelectedDate();
  const date = dateProp ?? selectedDate.date;
  const dayLabels = useDayLabels(selectedDate.today);
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const models = useFoodCardModels();
  const servingFormat = useServingFormat();
  const dir = useDirection();

  const isGeneralMode = !mealTypeProp;
  const [activeMealType, setActiveMealType] = useState<string>(mealTypeProp ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<MealCartEntry[]>([]);
  const selection = useMealSelection();
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const {
    data: products = [],
    isLoading: loadingProducts,
    loadMore: loadMoreProducts,
  } = usePantryProducts(search);
  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: savedMeals = [], isLoading: loadingSavedMeals } = useSavedMeals();
  const addMealItems = useAddMealItems(date);

  useFocusEffect(
    useCallback(() => {
      const pending = useMealReturn.getState().pendingProduct;
      if (!pending) return;
      useMealReturn.getState().clearPending();
      setActiveTab('products');
      setSearch('');
      if (!selectionRef.current.isSelected('product', pending.id)) {
        selectionRef.current.select({ kind: 'product', item: pending });
      }
    }, []),
  );

  const mealTypeLabel = MEAL_TYPE_KEY[activeMealType]
    ? t(`mealTypes.${MEAL_TYPE_KEY[activeMealType]}`)
    : '';

  const screenTitle = activeMealType
    ? t('addItem.title', { mealType: mealTypeLabel })
    : t('addItem.titleGeneral');

  const dateSubtitle =
    date === selectedDate.today
      ? undefined
      : t('addItem.forDate', { date: dayLabels.relative(date) ?? dayLabels.full(date) });

  const filteredProducts = useMemo(
    () => sortByMealCategory(products, mealTypeToCategory(activeMealType)),
    [products, activeMealType],
  );
  const filteredRecipes = useMemo(
    () => matchesSearch(matchesMealType(recipes, activeMealType), search),
    [recipes, search, activeMealType],
  );
  const filteredMeals = useMemo(
    () => matchesSearch(matchesMealType(savedMeals, activeMealType), search),
    [savedMeals, search, activeMealType],
  );

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    selection.deselect();
    setSearch('');
  }

  function handleMealTypeChange(nextMealType: string) {
    setActiveMealType(nextMealType);
    const keepsSelection =
      selection.selected?.kind === 'product' &&
      (selection.selected.item.mealCategories ?? []).length === 0;
    if (!keepsSelection) selection.deselect();
  }

  function handleAddToCart() {
    if (!activeMealType) {
      Alert.alert('', t('addItem.chooseMealType'));
      return;
    }
    const entry = selection.buildEntry(activeMealType);
    if (!entry) {
      Alert.alert('', t('addItem.invalidAmount'));
      return;
    }
    setCart((prev) => [...prev, entry]);
    selection.deselect();
  }

  async function handleSave() {
    if (cart.length === 0 || addMealItems.isPending) return;
    const submitted = cart;
    try {
      await addMealItems.mutateAsync(submitted.map((entry) => entry.payload));
      router.back();
    } catch (err: unknown) {
      // Keep only what was not logged, so retrying never logs an item twice.
      if (err instanceof PartialAddMealItemsError && err.savedCount > 0) {
        const savedKeys = new Set(submitted.slice(0, err.savedCount).map((entry) => entry.key));
        setCart((prev) => prev.filter((entry) => !savedKeys.has(entry.key)));
        Alert.alert('', t('addItem.logPartialError', { count: err.savedCount }));
        return;
      }
      Alert.alert('', t('addItem.logError'));
    }
  }

  function amountLabel(amount: SelectedAmount) {
    if (amount.kind === 'product') return servingFormat.amount(amount.product, amount);
    if (amount.kind === 'recipe') return t('addItem.recipeAmount', { count: amount.servings });
    return t('addItem.wholeMeal');
  }

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
    activeTab === 'products' ? loadingProducts : activeTab === 'recipes' ? loadingRecipes : loadingSavedMeals;

  const duplicateNames = useDuplicateNames(products.map((product) => product.name));

  const listData: ListItem[] =
    activeTab === 'products' ? filteredProducts : activeTab === 'recipes' ? filteredRecipes : filteredMeals;

  const emptyKey =
    activeTab === 'products' ? 'addItem.noProducts' : activeTab === 'recipes' ? 'addItem.noRecipes' : 'addItem.noSavedMeals';

  const searchPlaceholder =
    activeTab === 'products'
      ? t('addItem.searchProducts')
      : activeTab === 'recipes'
        ? t('addItem.searchRecipes')
        : t('addItem.searchSavedMeals');

  function renderItem({ item }: { item: ListItem }) {
    if (activeTab === 'products') {
      const product = item as PantryProduct;
      const isSelected = selection.isSelected('product', product.id);
      return (
        <FoodItemCard
          {...models.product(product, isAmbiguousName(duplicateNames, product.name))}
          selected={isSelected}
          accessibilityHint={isSelected ? t('addItem.tapToDeselect') : undefined}
          onPress={() => selection.select({ kind: 'product', item: product })}
        />
      );
    }

    if (activeTab === 'recipes') {
      const recipe = item as PantryRecipe;
      const isSelected = selection.isSelected('recipe', recipe.id);
      return (
        <FoodItemCard
          {...models.recipe(recipe)}
          selected={isSelected}
          accessibilityHint={isSelected ? t('addItem.tapToDeselect') : undefined}
          onPress={() => selection.select({ kind: 'recipe', item: recipe })}
        />
      );
    }

    const meal = item as SavedMeal;
    const isSelected = selection.isSelected('savedMeal', meal.id);
    return (
      <FoodItemCard
        {...models.savedMeal(meal)}
        selected={isSelected}
        accessibilityHint={isSelected ? t('addItem.tapToDeselect') : undefined}
        onPress={() => selection.select({ kind: 'savedMeal', item: meal })}
      />
    );
  }

  const cartCalories = cart.reduce((sum, entry) => sum + entry.calories, 0);
  const showDock = Boolean(selection.selected) || cart.length > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']} key={i18n.language}>
      <ScreenHeader
        title={screenTitle}
        subtitle={dateSubtitle}
        rightElement={
          <Button label={t('addItem.done')} variant="ghost" size="sm" onPress={() => router.back()} />
        }
      />

      <KeyboardAvoider>
        <View style={styles.controls}>
          {isGeneralMode ? (
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, dir.text]}>{t('addItem.mealLabel')}</Text>
              <SegmentedControl
                options={mealTypeOptions}
                value={activeMealType || null}
                onChange={handleMealTypeChange}
                onDeselect={() => handleMealTypeChange('')}
              />
            </View>
          ) : null}

          <SegmentedControl variant="tabs" options={tabs} value={activeTab} onChange={handleTabPress} />

          <SearchField
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              selection.deselect();
            }}
            placeholder={searchPlaceholder}
            trailing={
              activeTab === 'products' ? (
                <>
                  <IconButton
                    icon="barcode-scan"
                    variant="tonal"
                    size={44}
                    iconSize={22}
                    accessibilityLabel={t('addItem.scanBarcode')}
                    onPress={() => router.push('/(app)/pantry/barcode?returnTo=meal')}
                  />
                  <IconButton
                    icon="plus"
                    variant="tonal"
                    size={44}
                    iconSize={24}
                    accessibilityLabel={t('addItem.createProduct')}
                    onPress={() => router.push('/(app)/pantry/add-product?returnTo=meal')}
                  />
                </>
              ) : null
            }
          />

        </View>

        {isLoading ? (
          <StateView variant="loading" />
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
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
                actionLabel={activeTab === 'products' ? t('addItem.createProduct') : undefined}
                onAction={
                  activeTab === 'products'
                    ? () => router.push('/(app)/pantry/add-product?returnTo=meal')
                    : undefined
                }
              />
            }
            renderItem={renderItem}
          />
        )}

        {showDock ? (
          <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, DOCK_MIN_BOTTOM) }]}>
            {selection.selected ? (
              <SelectionPanel
                selected={selection.selected}
                quantity={selection.quantity}
                unit={selection.unit}
                unitOptions={selection.unitOptions}
                nutrition={selection.nutrition}
                onChangeQuantity={selection.setQuantity}
                onChangeUnit={selection.changeUnit}
                onStep={selection.step}
                onDeselect={selection.deselect}
              />
            ) : (
              <ScrollView style={styles.cartScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {cart.map((entry, index) => (
                  <View
                    key={entry.key}
                    style={[styles.cartRow, dir.row, index > 0 && styles.cartRowDivider]}
                  >
                    <View style={styles.cartText}>
                      <Text style={[styles.cartItemName, dir.text]} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      <Text style={[styles.cartItemQty, dir.text]} numberOfLines={1}>
                        {amountLabel(entry.amount)}
                      </Text>
                    </View>
                    <Text style={styles.cartItemCalories}>{formatCalories(entry.calories)}</Text>
                    <IconButton
                      icon="close"
                      size={36}
                      iconSize={18}
                      accessibilityLabel={t('addItem.removeFromList', { name: entry.name })}
                      onPress={() => setCart((prev) => prev.filter((e) => e.key !== entry.key))}
                    />
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.bar, dir.row]}>
              {cart.length > 0 ? (
                <View style={styles.barSummary}>
                  <Text style={[styles.barCount, dir.text]} numberOfLines={1}>
                    {t('addItem.cartItems', { count: cart.length })}
                  </Text>
                  <Text style={[styles.barCalories, dir.text]} numberOfLines={1}>
                    {t('addItem.caloriesAmount', { calories: formatCalories(cartCalories) })}
                  </Text>
                </View>
              ) : null}

              {selection.selected ? (
                <Button
                  label={t('addItem.addToList')}
                  icon="plus"
                  onPress={handleAddToCart}
                  disabled={!selection.nutrition}
                  variant={cart.length > 0 ? 'tonal' : 'primary'}
                  style={styles.barButton}
                />
              ) : (
                <Button
                  label={
                    addMealItems.isPending
                      ? t('addItem.saving')
                      : t('addItem.saveButton', { mealType: mealTypeLabel })
                  }
                  onPress={handleSave}
                  loading={addMealItems.isPending}
                  style={styles.barButton}
                />
              )}
            </View>
          </View>
        ) : null}
      </KeyboardAvoider>
    </SafeAreaView>
  );
}
