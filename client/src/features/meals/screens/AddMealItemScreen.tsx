import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
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
import { useAddMealItemOnDate } from '../../day-log/hooks/useDayLog';
import { PantryProduct, PantryRecipe, ProductCategory, SavedMeal } from '../../pantry/types';
import { MEAL_SHORTCUTS } from '../constants/mealShortcuts';
import { FoodItemCard } from '../../pantry/components/food/FoodItemCard';
import { useFoodCardModels } from '../../pantry/hooks/useFoodCardModels';
import { useMealReturn } from '../../pantry/mealReturnStore';
import { sortByMealCategory } from '../../pantry/helpers/sortByMealCategory';
import { recipeMealTypes } from '../../pantry/helpers/recipeMealTypes';
import { hasRemovedSavedMealItems } from '../../pantry/helpers/savedMealItems';
import { useDirection } from '../../../shared/hooks/useDirection';
import { showToast } from '../../../shared/helpers/toast';
import { DateKey } from '../../../shared/helpers/dateKey';
import { useSelectedDate } from '../../day-log/hooks/useSelectedDate';
import { useDayLabels } from '../../day-log/hooks/useDayLabels';
import { SelectionPanel } from '../components/SelectionPanel';
import { useMealSelection } from '../hooks/useMealSelection';
import { useStyles } from './styles/AddMealItemScreen.styles';
import { matchesAllTerms } from "../../../shared/helpers/searchTerms";

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

function matchesMealType<T>(items: T[], mealType: string, typesOf: (item: T) => readonly string[]) {
  if (!mealType) return items;
  return items.filter((item) => {
    const types = typesOf(item);
    if (types.length === 0) return true;
    return types.some((type) => type === mealType || (isSnack(mealType) && isSnack(type)));
  });
}

function matchesSearch<T extends { name: string }>(items: T[], search: string) {
  return search.trim() ? items.filter((item) => matchesAllTerms(search, item.name)) : items;
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
  const dir = useDirection();

  const isGeneralMode = !mealTypeProp;
  const [activeMealType, setActiveMealType] = useState<string>(mealTypeProp ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
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
  const addMealItem = useAddMealItemOnDate();

  useFocusEffect(
    useCallback(() => {
      const pending = useMealReturn.getState().take('meal');
      if (!pending) return;
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
    () => matchesSearch(matchesMealType(recipes, activeMealType, (recipe) => recipeMealTypes(recipe)), search),
    [recipes, search, activeMealType],
  );
  const filteredMeals = useMemo(
    () => matchesSearch(matchesMealType(savedMeals, activeMealType, (meal) => meal.mealTypes), search),
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

  async function handleAdd() {
    if (addMealItem.isPending) return;
    if (!activeMealType) {
      Alert.alert('', t('addItem.chooseMealType'));
      return;
    }
    const entry = selection.buildEntry(activeMealType);
    if (!entry) {
      Alert.alert('', t('addItem.invalidAmount'));
      return;
    }
    try {
      await addMealItem.mutateAsync({ date, payload: entry.payload });
      selection.deselect();
      showToast({ message: t('addItem.addedTo', { name: entry.name, mealType: mealTypeLabel }) });
      if (router.canGoBack()) router.back();
      else router.replace('/(app)/dashboard');
    } catch {
      Alert.alert('', t('addItem.logError'));
    }
  }

  const tabs: Array<{ value: Tab; label: string }> = [
    { value: 'products', label: t('addItem.tabProducts') },
    { value: 'savedMeals', label: t('addItem.tabSavedMeals') },
    { value: 'recipes', label: t('addItem.tabRecipes') },
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

  const selectedMeal = selection.selected?.kind === 'savedMeal' ? selection.selected.item : null;
  const hasRemovedItems = selectedMeal ? hasRemovedSavedMealItems(selectedMeal) : false;

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

        {selection.selected ? (
          <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, DOCK_MIN_BOTTOM) }]}>
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

            {selectedMeal && hasRemovedItems ? (
              <View style={[styles.notice, dir.row]} accessibilityLiveRegion="polite">
                <Text style={[styles.noticeText, dir.text]}>{t('addItem.removedItems')}</Text>
                <Button
                  label={t('addItem.editMeal')}
                  variant="tonal"
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/pantry/add-saved-meal',
                      params: { id: selectedMeal.id, mode: 'edit' },
                    })
                  }
                />
              </View>
            ) : null}

            <Button
              label={activeMealType ? t('addItem.title', { mealType: mealTypeLabel }) : t('addItem.addButton')}
              icon="plus"
              onPress={handleAdd}
              loading={addMealItem.isPending}
              disabled={!selection.nutrition || hasRemovedItems}
              fullWidth
            />
          </View>
        ) : null}
      </KeyboardAvoider>
    </SafeAreaView>
  );
}
