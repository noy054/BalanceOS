import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../shared/components/ui/Button';
import { AppBackdrop } from '../../../shared/components/ui/AppBackdrop';
import { IconButton } from '../../../shared/components/ui/IconButton';
import { SearchField } from '../../../shared/components/ui/SearchField';
import { StateView } from '../../../shared/components/ui/StateView';
import { ListGap } from '../../../shared/components/ui/ListGap';
import { isAmbiguousName, useDuplicateNames } from '../../pantry/helpers/duplicateNames';
import { KeyboardAvoider } from '../../../shared/components/ui/KeyboardAvoider';
import { useFrequentProducts, usePantryProducts } from '../../pantry/hooks/usePantry';
import { useRecipes } from '../../pantry/hooks/useRecipes';
import { useSavedMeals } from '../../pantry/hooks/useSavedMeals';
import { useAddMealItemOnDate } from '../../day-log/hooks/useDayLog';
import { PantryProduct, PantryRecipe, ProductCategory, SavedMeal } from '../../pantry/types';
import { useFoodCardModels } from '../../pantry/hooks/useFoodCardModels';
import { useMealReturn } from '../../pantry/mealReturnStore';
import { sortByMealCategory } from '../../pantry/helpers/sortByMealCategory';
import { recipeMealTypes } from '../../pantry/helpers/recipeMealTypes';
import { hasRemovedSavedMealItems } from '../../pantry/helpers/savedMealItems';
import { FOOD_CATEGORIES, FoodCategory } from '../../pantry/helpers/pantryFilters';
import { useDirection } from '../../../shared/hooks/useDirection';
import { showToast } from '../../../shared/helpers/toast';
import { DateKey } from '../../../shared/helpers/dateKey';
import { useAppTheme } from '../../../shared/theme';
import { useSelectedDate } from '../../day-log/hooks/useSelectedDate';
import { useDayLabels } from '../../day-log/hooks/useDayLabels';
import { SelectionPanel } from '../components/SelectionPanel';
import { AddFoodTabs } from '../components/AddFoodTabs';
import { FoodCategoryTiles } from '../components/FoodCategoryTiles';
import { ProductPickRow, RecipePickRow, SavedMealPickRow } from '../components/PickListRows';
import { MealPicker } from '../components/MealPicker';
import { SelectedItem, useMealSelection } from '../hooks/useMealSelection';
import { useStyles } from './styles/AddMealItemScreen.styles';
import { matchesAllTerms } from '../../../shared/helpers/searchTerms';

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
  const { colors } = useAppTheme();

  const [activeMealType, setActiveMealType] = useState<string>(mealTypeProp ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FoodCategory>('all');
  const [showAll, setShowAll] = useState(false);
  const [quantityFocused, setQuantityFocused] = useState(false);
  const selection = useMealSelection();
  const selectionRef = useRef(selection);
  const compactForQuantity = quantityFocused && selection.selected !== null;
  selectionRef.current = selection;

  const productCategory = activeTab === 'products' ? category : 'all';
  const {
    data: products = [],
    isLoading: loadingProducts,
    loadMore: loadMoreProducts,
  } = usePantryProducts(search, 'newest', productCategory);
  const { data: frequent = [], isPending: loadingFrequent } = useFrequentProducts(activeTab === 'products');
  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: savedMeals = [], isLoading: loadingSavedMeals } = useSavedMeals();
  const addMealItem = useAddMealItemOnDate();

  useFocusEffect(
    useCallback(() => {
      useMealReturn.getState().endSuperPick();
      const pending = useMealReturn.getState().take('meal');
      if (!pending) return;
      setActiveTab('products');
      setSearch('');
      setCategory('all');
      if (!selectionRef.current.isSelected('product', pending.id)) {
        selectionRef.current.select({ kind: 'product', item: pending });
      }
    }, []),
  );

  function openCreateProduct() {
    router.push('/(app)/pantry/add-product?returnTo=meal');
  }

  function openSuper() {
    const params: Record<string, string> = {};
    if (mealTypeProp) params.mealType = mealTypeProp;
    if (dateProp) params.date = dateProp;
    useMealReturn.getState().startSuperPick({
      target: 'meal',
      returnHref: { pathname: '/(app)/meal/add-item', params },
    });
    router.push('/(app)/pantry/super');
  }

  const mealTypeLabel = MEAL_TYPE_KEY[activeMealType] ? t(`mealTypes.${MEAL_TYPE_KEY[activeMealType]}`) : '';

  const dateSubtitle =
    date === selectedDate.today
      ? undefined
      : t('addItem.forDate', { date: dayLabels.relative(date) ?? dayLabels.full(date) });

  const isBrowsing = !search.trim() && category === 'all';
  const showFrequent = activeTab === 'products' && isBrowsing && !showAll && frequent.length > 0;

  const filteredProducts = useMemo(
    () => sortByMealCategory(showFrequent ? frequent : products, mealTypeToCategory(activeMealType)),
    [showFrequent, frequent, products, activeMealType],
  );
  const filteredRecipes = useMemo(
    () =>
      matchesSearch(matchesMealType(recipes, activeMealType, (recipe) => recipeMealTypes(recipe)), search),
    [recipes, search, activeMealType],
  );
  const filteredMeals = useMemo(
    () =>
      matchesSearch(matchesMealType(savedMeals, activeMealType, (meal) => meal.mealTypes), search),
    [savedMeals, search, activeMealType],
  );

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    selection.deselect();
    setSearch('');
    if (tab !== 'products') setCategory('all');
  }

  function handleMealTypeChange(nextMealType: string) {
    setActiveMealType(nextMealType);
    const keepsSelection =
      selection.selected?.kind === 'product' && (selection.selected.item.mealCategories ?? []).length === 0;
    if (!keepsSelection) selection.deselect();
  }

  function handleCategoryChange(next: FoodCategory) {
    setCategory(next);
    selection.deselect();
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/dashboard');
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
      goBack();
    } catch {
      Alert.alert('', t('addItem.logError'));
    }
  }

  const tabs = [
    { value: 'products' as Tab, label: t('addItem.tabProducts'), icon: 'basket-outline' as const },
    { value: 'savedMeals' as Tab, label: t('addItem.tabSavedMeals'), icon: 'layers-outline' as const },
    { value: 'recipes' as Tab, label: t('addItem.tabRecipes'), icon: 'chef-hat' as const },
  ];

  const isLoading =
    activeTab === 'products'
      ? (isBrowsing && !showAll && loadingFrequent) || (loadingProducts && !showFrequent)
      : activeTab === 'recipes'
        ? loadingRecipes
        : loadingSavedMeals;

  const duplicateNames = useDuplicateNames(products.map((product) => product.name));

  const listData: ListItem[] =
    activeTab === 'products' ? filteredProducts : activeTab === 'recipes' ? filteredRecipes : filteredMeals;

  const emptyKey =
    activeTab === 'products' ? 'addItem.noProducts' : activeTab === 'recipes' ? 'addItem.noRecipes' : 'addItem.noSavedMeals';

  const searchPlaceholder =
    activeTab === 'products'
      ? t('addItem.searchFood')
      : activeTab === 'recipes'
        ? t('addItem.searchRecipes')
        : t('addItem.searchSavedMeals');

  const selectItem = useCallback((entry: SelectedItem) => selectionRef.current.select(entry), []);
  const selectedKind = selection.selected?.kind ?? null;
  const selectedId = selection.selected?.item.id ?? null;

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (activeTab === 'products') {
        const product = item as PantryProduct;
        return (
          <ProductPickRow
            product={product}
            ambiguous={isAmbiguousName(duplicateNames, product.name)}
            selected={selectedKind === 'product' && selectedId === product.id}
            onSelect={selectItem}
          />
        );
      }
      if (activeTab === 'recipes') {
        const recipe = item as PantryRecipe;
        return (
          <RecipePickRow
            recipe={recipe}
            selected={selectedKind === 'recipe' && selectedId === recipe.id}
            onSelect={selectItem}
          />
        );
      }
      const meal = item as SavedMeal;
      return (
        <SavedMealPickRow
          meal={meal}
          selected={selectedKind === 'savedMeal' && selectedId === meal.id}
          onSelect={selectItem}
        />
      );
    },
    [activeTab, duplicateNames, selectedKind, selectedId, selectItem],
  );

  const sectionHeader =
    activeTab === 'products' && isBrowsing ? (
      <View style={[styles.sectionHeader, dir.row]}>
        <View style={[styles.sectionTitleRow, dir.row]}>
          <MaterialCommunityIcons
            name={showFrequent ? 'fire' : 'basket-outline'}
            size={18}
            color={colors.textPrimary}
          />
          <Text style={styles.sectionTitle}>
            {showFrequent ? t('addItem.frequentTitle') : t('addItem.allProductsTitle')}
          </Text>
        </View>
        {frequent.length > 0 ? (
          <Pressable
            onPress={() => setShowAll((value) => !value)}
            accessibilityRole="button"
            hitSlop={10}
            style={[styles.sectionLink, dir.row]}
          >
            <Text style={styles.sectionLinkText}>{showFrequent ? t('addItem.showAll') : t('addItem.showFrequent')}</Text>
            <MaterialCommunityIcons name={dir.forwardIcon} size={16} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>
    ) : undefined;

  const selectedMeal = selection.selected?.kind === 'savedMeal' ? selection.selected.item : null;
  const hasRemovedItems = selectedMeal ? hasRemovedSavedMealItems(selectedMeal) : false;

  return (
    <SafeAreaView style={styles.root} edges={['top']} key={i18n.language}>
      <AppBackdrop />
      <View style={[styles.header, dir.row]}>
        <IconButton
          icon={dir.backIcon}
          variant="glass"
          size={38}
          iconSize={22}
          color={colors.textPrimary}
          accessibilityLabel={t('addItem.back')}
          onPress={goBack}
          style={styles.backButton}
        />
        <View style={styles.headerTitle} pointerEvents="none">
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {t('addItem.screenTitle')}
          </Text>
          {dateSubtitle ? <Text style={styles.subtitle}>{dateSubtitle}</Text> : null}
        </View>
      </View>

      <KeyboardAvoider>
        <View style={[styles.controls, compactForQuantity && styles.hidden]}>
          <MealPicker value={activeMealType} label={mealTypeLabel} onChange={handleMealTypeChange} />

          <AddFoodTabs options={tabs} value={activeTab} onChange={handleTabPress} />

          <SearchField
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              selection.deselect();
            }}
            placeholder={searchPlaceholder}
            tone="glass"
            fieldStyle={styles.searchField}
            accessory={
              activeTab === 'products' ? (
                <IconButton
                  icon="barcode-scan"
                  size={36}
                  iconSize={20}
                  color={colors.textPrimary}
                  accessibilityLabel={t('addItem.scanBarcode')}
                  onPress={() => router.push('/(app)/pantry/barcode?returnTo=meal')}
                  style={styles.scanButton}
                />
              ) : null
            }
          />

          {activeTab === 'products' ? (
            <View style={[styles.sourceActions, dir.row]}>
              <Pressable
                onPress={openCreateProduct}
                accessibilityRole="button"
                accessibilityLabel={t('addItem.createManuallyA11y')}
                style={({ pressed }) => [styles.sourceAction, dir.row, pressed && styles.sourceActionPressed]}
              >
                <MaterialCommunityIcons name="pencil-plus-outline" size={18} color={colors.accent} />
                <Text style={styles.sourceActionText} numberOfLines={2}>
                  {t('addItem.createManually')}
                </Text>
              </Pressable>
              <Pressable
                onPress={openSuper}
                accessibilityRole="button"
                accessibilityLabel={t('addItem.browseSuperA11y')}
                style={({ pressed }) => [styles.sourceAction, dir.row, pressed && styles.sourceActionPressed]}
              >
                <MaterialCommunityIcons name="storefront-outline" size={18} color={colors.accent} />
                <Text style={styles.sourceActionText} numberOfLines={2}>
                  {t('addItem.browseSuper')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {activeTab === 'products' ? (
            <FoodCategoryTiles categories={FOOD_CATEGORIES} value={category} onChange={handleCategoryChange} />
          ) : null}
        </View>

        {isLoading ? (
          <StateView variant="loading" />
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => item.id}
            style={[styles.list, compactForQuantity && styles.hidden]}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            onEndReached={activeTab === 'products' && !showFrequent ? loadMoreProducts : undefined}
            onEndReachedThreshold={0.5}
            ItemSeparatorComponent={ListGap}
            ListHeaderComponent={sectionHeader}
            ListFooterComponent={
              activeTab === 'products' && listData.length > 0 ? (
                <Pressable
                  onPress={openCreateProduct}
                  accessibilityRole="button"
                  style={[styles.createLink, dir.row]}
                >
                  <MaterialCommunityIcons name="plus" size={16} color={colors.textSecondary} />
                  <Text style={styles.createLinkText}>{t('addItem.createProduct')}</Text>
                </Pressable>
              ) : undefined
            }
            ListEmptyComponent={
              <StateView
                variant="empty"
                compact
                icon={search.trim() ? 'magnify' : 'tray'}
                title={t(emptyKey as Parameters<typeof t>[0])}
                actionLabel={activeTab === 'products' ? t('addItem.createProduct') : undefined}
                onAction={activeTab === 'products' ? openCreateProduct : undefined}
              />
            }
            renderItem={renderItem}
          />
        )}

        {compactForQuantity ? (
          <Pressable
            style={styles.list}
            onPress={Keyboard.dismiss}
            accessible={false}
          />
        ) : null}

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
              onPickLeftover={selection.pickLeftoverPortion}
              onStep={selection.step}
              onDeselect={() => {
                setQuantityFocused(false);
                selection.deselect();
              }}
              onQuantityFocusChange={setQuantityFocused}
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
