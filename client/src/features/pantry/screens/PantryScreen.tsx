import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Alert, FlatList, View } from "react-native";
import { useTranslation } from "react-i18next";
import { confirmAction } from "../../../shared/helpers/confirm";
import { router } from "expo-router";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { TabHeader } from "../../../shared/components/TabHeader";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { SearchField } from "../../../shared/components/ui/SearchField";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { ActionSheet, SheetAction } from "../../../shared/components/ui/ActionSheet";
import { PantryEmptyState } from "../components/shared/PantryEmptyState";
import { SwipeDeleteRow } from "../components/shared/SwipeDeleteRow";
import { ProductCard } from "../components/products/ProductCard";
import { ProductCalculatorModal } from "../components/products/ProductCalculatorModal";
import { RecipeCard } from "../components/recipes/RecipeCard";
import { SavedMealCard } from "../components/saved-meals/SavedMealCard";
import { usePantryProducts, useDeletePantryProduct } from "../hooks/usePantry";
import { usePantryHighlight } from "../pantryHighlightStore";
import { useRecipes, useDeleteRecipe } from "../hooks/useRecipes";
import { useSavedMeals, useDeleteSavedMeal } from "../hooks/useSavedMeals";
import { PantryProduct, PantryRecipe, PantryTab, SavedMeal } from "../types";
import { useStyles } from "./styles/PantryScreen.styles";
import { ListGap } from "../../../shared/components/ui/ListGap";
import { isAmbiguousName, useDuplicateNames } from "../helpers/duplicateNames";

type MenuTarget =
  | { kind: "product"; item: PantryProduct }
  | { kind: "recipe"; item: PantryRecipe }
  | { kind: "savedMeal"; item: SavedMeal };

export function PantryScreen() {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PantryTab>("products");
  const [calculatorProduct, setCalculatorProduct] =
    useState<PantryProduct | null>(null);
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const productListRef = useRef<FlatList>(null);
  const { highlightedProductId, clearHighlight } = usePantryHighlight();

  const deleteProduct = useDeletePantryProduct();
  const deleteRecipe = useDeleteRecipe();
  const deleteSavedMeal = useDeleteSavedMeal();

  const {
    data: products = [],
    isLoading: loadingProducts,
    isError: errorProducts,
    loadMore: loadMoreProducts,
    hasNextPage: hasMoreProducts,
    isFetchingNextPage: isLoadingMoreProducts,
  } = usePantryProducts(search);

  const {
    data: recipes = [],
    isLoading: loadingRecipes,
    isError: errorRecipes,
  } = useRecipes();

  const {
    data: savedMeals = [],
    isLoading: loadingSavedMeals,
    isError: errorSavedMeals,
  } = useSavedMeals();

  const duplicateNames = useDuplicateNames(products.map((product) => product.name));

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) {
      return recipes;
    }

    const q = search.toLowerCase();

    return recipes.filter((recipe) => recipe.name.toLowerCase().includes(q));
  }, [recipes, search]);

  const filteredMeals = useMemo(() => {
    if (!search.trim()) {
      return savedMeals;
    }

    const q = search.toLowerCase();

    return savedMeals.filter((meal) => meal.name.toLowerCase().includes(q));
  }, [savedMeals, search]);

  useEffect(() => {
    if (!highlightedProductId || !hasMoreProducts || isLoadingMoreProducts) return;
    if (products.some((p) => p.id === highlightedProductId)) return;
    loadMoreProducts();
  }, [highlightedProductId, products, hasMoreProducts, isLoadingMoreProducts, loadMoreProducts]);

  // Scroll to and highlight a product navigated from the barcode "exists" flow
  useEffect(() => {
    if (!highlightedProductId) return;

    // Ensure the products tab is active and search is cleared so the item is visible
    setActiveTab("products");
    setSearch("");

    // Always schedule the highlight clear, even if the item is not yet in the list
    const clearTimer = setTimeout(() => clearHighlight(), 3500);

    if (products.length === 0) return () => clearTimeout(clearTimer);

    const index = products.findIndex((p) => p.id === highlightedProductId);
    if (index === -1) return () => clearTimeout(clearTimer);

    const scrollTimer = setTimeout(() => {
      productListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.3,
      });
    }, 350);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [highlightedProductId, products, clearHighlight]);

  const isDeletingRecipe = deleteRecipe.isPending;
  const isDeletingSavedMeal = deleteSavedMeal.isPending;

  function handleAdd() {
    if (activeTab === "products") {
      router.push("/(app)/pantry/add-product");
      return;
    }

    if (activeTab === "recipes") {
      router.push("/(app)/pantry/add-recipe");
      return;
    }

    router.push("/(app)/pantry/add-saved-meal");
  }

  function handleScanBarcode() {
    router.push("/(app)/pantry/barcode");
  }

  function handleProductPress(product: PantryProduct) {
    router.push(`/(app)/pantry/${product.id}`);
  }

  async function handleDeleteProduct(product: PantryProduct) {
    const confirmed = await confirmAction({
      title: t("productDetail.deleteConfirmTitle"),
      message: t("productDetail.deleteConfirmMessage"),
      confirmLabel: t("productDetail.deleteConfirmYes"),
      cancelLabel: t("productDetail.deleteConfirmNo"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteProduct.mutateAsync(product.id);
    } catch {
      Alert.alert("", t("errors.deleteFailed"));
    }
  }

  async function handleDeleteRecipe(recipe: PantryRecipe) {
    const confirmed = await confirmAction({
      title: t("recipe.deleteConfirmTitle"),
      message: t("recipe.deleteConfirmMessage"),
      confirmLabel: t("recipe.deleteConfirmYes"),
      cancelLabel: t("recipe.deleteConfirmNo"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteRecipe.mutateAsync(recipe.id);
    } catch {
      Alert.alert("", t("errors.deleteFailed"));
    }
  }

  async function handleDeleteSavedMeal(meal: SavedMeal) {
    const confirmed = await confirmAction({
      title: t("savedMeal.deleteConfirmTitle"),
      message: t("savedMeal.deleteConfirmMessage"),
      confirmLabel: t("savedMeal.deleteConfirmYes"),
      cancelLabel: t("savedMeal.deleteConfirmNo"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteSavedMeal.mutateAsync(meal.id);
    } catch {
      Alert.alert("", t("errors.deleteFailed"));
    }
  }

  function addLabel() {
    if (activeTab === "products") {
      return t("actions.addProduct");
    }

    if (activeTab === "recipes") {
      return t("actions.addRecipe");
    }

    return t("actions.addSavedMeal");
  }

  function searchPlaceholder() {
    if (activeTab === "products") {
      return t("search.placeholder");
    }

    if (activeTab === "recipes") {
      return t("search.placeholderRecipes");
    }

    return t("search.placeholderSavedMeals");
  }

  function openEditor(target: MenuTarget) {
    const pathname =
      target.kind === "product"
        ? "/(app)/pantry/add-product"
        : target.kind === "recipe"
          ? "/(app)/pantry/add-recipe"
          : "/(app)/pantry/add-saved-meal";

    router.push({ pathname, params: { id: target.item.id, mode: "edit" } });
  }

  function getMenuActions(target: MenuTarget): SheetAction[] {
    const editAction: SheetAction = {
      key: "edit",
      label: t("common.edit"),
      icon: "pencil-outline",
      onPress: () => openEditor(target),
    };

    const deleteAction: SheetAction = {
      key: "delete",
      label: t("common.delete"),
      icon: "trash-can-outline",
      destructive: true,
      onPress: () => {
        if (target.kind === "product") {
          handleDeleteProduct(target.item);
        } else if (target.kind === "recipe") {
          handleDeleteRecipe(target.item);
        } else {
          handleDeleteSavedMeal(target.item);
        }
      },
    };

    if (target.kind === "product") {
      return [
        {
          key: "calculate",
          label: t("productCalculator.quickTitle"),
          icon: "calculator-variant-outline",
          onPress: () => setCalculatorProduct(target.item),
        },
        editAction,
        deleteAction,
      ];
    }

    return [editAction, deleteAction];
  }

  const tabOptions = [
    { value: "products" as PantryTab, label: t("tabs.products") },
    { value: "savedMeals" as PantryTab, label: t("tabs.savedMeals") },
    { value: "recipes" as PantryTab, label: t("tabs.recipes") },
  ];

  return (
    <TabScreenLayout activeTab="pantry">
      <View key={i18n.language} style={styles.root}>
        <TabHeader title={t("title")} />

        <SegmentedControl
          variant="tabs"
          options={tabOptions}
          value={activeTab}
          onChange={setActiveTab}
          style={styles.tabs}
        />

        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder()}
          style={styles.toolbar}
          trailing={
            <>
              {activeTab === "products" ? (
                <IconButton
                  icon="barcode-scan"
                  variant="tonal"
                  size={44}
                  accessibilityLabel={t("actions.scanBarcode")}
                  onPress={handleScanBarcode}
                />
              ) : null}
              <IconButton
                icon="plus"
                variant="filled"
                size={44}
                iconSize={24}
                accessibilityLabel={addLabel()}
                onPress={handleAdd}
              />
            </>
          }
        />

        <View style={styles.content}>
          {activeTab === "products" ? (
            <TabContent
              isLoading={loadingProducts}
              isError={errorProducts}
              isEmpty={products.length === 0}
              isSearching={search.trim().length > 0}
              errorKey="errors.loadFailed"
              tab="products"
            >
              <FlatList
                ref={productListRef}
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    onPress={handleProductPress}
                    onCalculate={setCalculatorProduct}
                    onEdit={(product) => openEditor({ kind: "product", item: product })}
                    onMore={(product) => setMenuTarget({ kind: "product", item: product })}
                    isHighlighted={item.id === highlightedProductId}
                    showBrand={isAmbiguousName(duplicateNames, item.name)}
                  />
                )}
                ItemSeparatorComponent={ListGap}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                onScrollToIndexFailed={({ index, averageItemLength }) => {
                  // Immediately jump to an estimated position, then retry the precise scroll
                  productListRef.current?.scrollToOffset({
                    offset: index * averageItemLength,
                    animated: true,
                  });
                  setTimeout(() => {
                    productListRef.current?.scrollToIndex({
                      index,
                      animated: false,
                      viewPosition: 0.3,
                    });
                  }, 300);
                }}
                onEndReached={loadMoreProducts}
                onEndReachedThreshold={0.5}
              />
            </TabContent>
          ) : null}

          {activeTab === "recipes" ? (
            <TabContent
              isLoading={loadingRecipes}
              isError={errorRecipes}
              isEmpty={filteredRecipes.length === 0}
              isSearching={search.trim().length > 0}
              errorKey="errors.loadRecipesFailed"
              tab="recipes"
            >
              <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SwipeDeleteRow
                    isRTL={isRTL}
                    label={t("common.delete")}
                    disabled={isDeletingRecipe}
                    onDelete={() => handleDeleteRecipe(item)}
                  >
                    <RecipeCard
                      recipe={item}
                      onPress={(recipe: PantryRecipe) =>
                        router.push(`/(app)/pantry/recipes/${recipe.id}`)
                      }
                      onEdit={(recipe) => openEditor({ kind: "recipe", item: recipe })}
                      onMore={(recipe) => setMenuTarget({ kind: "recipe", item: recipe })}
                    />
                  </SwipeDeleteRow>
                )}
                ItemSeparatorComponent={ListGap}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              />
            </TabContent>
          ) : null}

          {activeTab === "savedMeals" ? (
            <TabContent
              isLoading={loadingSavedMeals}
              isError={errorSavedMeals}
              isEmpty={filteredMeals.length === 0}
              isSearching={search.trim().length > 0}
              errorKey="errors.loadSavedMealsFailed"
              tab="savedMeals"
            >
              <FlatList
                data={filteredMeals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SwipeDeleteRow
                    isRTL={isRTL}
                    label={t("common.delete")}
                    disabled={isDeletingSavedMeal}
                    onDelete={() => handleDeleteSavedMeal(item)}
                  >
                    <SavedMealCard
                      meal={item}
                      onPress={(meal: SavedMeal) =>
                        router.push(`/(app)/pantry/saved-meals/${meal.id}`)
                      }
                      onEdit={(meal) => openEditor({ kind: "savedMeal", item: meal })}
                      onMore={(meal) => setMenuTarget({ kind: "savedMeal", item: meal })}
                    />
                  </SwipeDeleteRow>
                )}
                ItemSeparatorComponent={ListGap}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              />
            </TabContent>
          ) : null}
        </View>

        <ProductCalculatorModal
          visible={Boolean(calculatorProduct)}
          product={calculatorProduct}
          onClose={() => setCalculatorProduct(null)}
        />

        <ActionSheet
          visible={menuTarget !== null}
          title={menuTarget?.item.name}
          actions={menuTarget ? getMenuActions(menuTarget) : []}
          onClose={() => setMenuTarget(null)}
        />
      </View>
    </TabScreenLayout>
  );
}

function TabContent({
  isLoading,
  isError,
  isEmpty,
  isSearching,
  errorKey,
  tab,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isSearching: boolean;
  errorKey: string;
  tab: PantryTab;
  children: ReactNode;
}) {
  const { t } = useTranslation("pantry");

  if (isLoading) {
    return <StateView variant="loading" />;
  }

  if (isError) {
    return (
      <StateView
        variant="error"
        message={t(errorKey as Parameters<typeof t>[0])}
      />
    );
  }

  if (isEmpty) {
    if (isSearching) {
      return (
        <StateView
          variant="empty"
          icon="magnify"
          title={t("picker.noResults")}
        />
      );
    }

    return <PantryEmptyState tab={tab} />;
  }

  return <>{children}</>;
}
