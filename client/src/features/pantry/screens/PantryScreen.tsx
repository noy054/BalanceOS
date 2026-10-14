import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { useAppTheme } from "../../../shared/theme";
import { PantryHeader } from "../components/shared/PantryHeader";
import { PantrySearchBar } from "../components/shared/PantrySearchBar";
import { PantryTabBar } from "../components/shared/PantryTabBar";
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
import { getDirectionStyles, useStyles } from "./styles/PantryScreen.styles";

export function PantryScreen() {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PantryTab>("products");
  const [calculatorProduct, setCalculatorProduct] =
    useState<PantryProduct | null>(null);

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

  function handleQuickCalculate(product: PantryProduct) {
    setCalculatorProduct(product);
  }

  function handleCloseCalculator() {
    setCalculatorProduct(null);
  }

  function handleDeleteProduct(product: PantryProduct) {
    Alert.alert(
      t("productDetail.deleteConfirmTitle"),
      t("productDetail.deleteConfirmMessage"),
      [
        {
          text: t("productDetail.deleteConfirmNo"),
          style: "cancel",
        },
        {
          text: t("productDetail.deleteConfirmYes"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(product.id);
            } catch {
              Alert.alert("", t("errors.deleteFailed"));
            }
          },
        },
      ],
    );
  }

  function handleDeleteRecipe(recipe: PantryRecipe) {
    Alert.alert(
      t("recipe.deleteConfirmTitle", {
        defaultValue: "למחוק מתכון?",
      }),
      t("recipe.deleteConfirmMessage", {
        defaultValue: "המתכון יימחק מהרשימה שלך.",
      }),
      [
        {
          text: t("recipe.deleteConfirmNo", {
            defaultValue: "ביטול",
          }),
          style: "cancel",
        },
        {
          text: t("recipe.deleteConfirmYes", {
            defaultValue: "מחיקה",
          }),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe.mutateAsync(recipe.id);
            } catch {
              Alert.alert("", t("errors.deleteFailed"));
            }
          },
        },
      ],
    );
  }

  function handleDeleteSavedMeal(meal: SavedMeal) {
    Alert.alert(
      t("savedMeal.deleteConfirmTitle", {
        defaultValue: "למחוק ארוחה?",
      }),
      t("savedMeal.deleteConfirmMessage", {
        defaultValue: "הארוחה השמורה תימחק מהרשימה שלך.",
      }),
      [
        {
          text: t("savedMeal.deleteConfirmNo", {
            defaultValue: "ביטול",
          }),
          style: "cancel",
        },
        {
          text: t("savedMeal.deleteConfirmYes", {
            defaultValue: "מחיקה",
          }),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedMeal.mutateAsync(meal.id);
            } catch {
              Alert.alert("", t("errors.deleteFailed"));
            }
          },
        },
      ],
    );
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

  return (
    <TabScreenLayout activeTab="pantry">
      <View key={i18n.language} style={styles.root}>
        <PantryHeader />

        <View style={styles.searchRow}>
          <PantrySearchBar value={search} onChangeText={setSearch} />
        </View>

        <View style={[styles.actionsRow, dir.row]}>
          <Pressable style={[styles.actionBtn, dir.row]} onPress={handleAdd}>
            <MaterialCommunityIcons
              name="plus"
              size={16}
              color={colors.background}
            />

            <Text style={[styles.actionBtnText, dir.text]}>{addLabel()}</Text>
          </Pressable>

          {activeTab === "products" ? (
            <Pressable
              style={[styles.actionBtn, dir.row, styles.actionBtnOutline]}
              onPress={handleScanBarcode}
            >
              <MaterialCommunityIcons
                name="barcode-scan"
                size={16}
                color={colors.primaryGreen}
              />

              <Text
                style={[
                  styles.actionBtnText,
                  styles.actionBtnTextOutline,
                  dir.text,
                ]}
              >
                {t("actions.scanBarcode")}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <PantryTabBar activeTab={activeTab} onTabPress={setActiveTab} />

        <View style={styles.content}>
          {activeTab === "products" ? (
            <TabContent
              isLoading={loadingProducts}
              isError={errorProducts}
              isEmpty={products.length === 0}
              errorKey="errors.loadFailed"
              tab="products"
              isRTL={isRTL}
            >
              <FlatList
                ref={productListRef}
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    onPress={handleProductPress}
                    onDelete={handleDeleteProduct}
                    onQuickCalculate={handleQuickCalculate}
                    isHighlighted={item.id === highlightedProductId}
                  />
                )}
                contentContainerStyle={styles.listContent}
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
              errorKey="errors.loadRecipesFailed"
              tab="recipes"
              isRTL={isRTL}
            >
              <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SwipeDeleteRow
                    isRTL={isRTL}
                    label={t("actions.delete", {
                      defaultValue: "מחיקה",
                    })}
                    disabled={isDeletingRecipe}
                    onDelete={() => handleDeleteRecipe(item)}
                  >
                    <RecipeCard
                      recipe={item}
                      onPress={(recipe: PantryRecipe) =>
                        router.push(`/(app)/pantry/recipes/${recipe.id}`)
                      }
                    />
                  </SwipeDeleteRow>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </TabContent>
          ) : null}

          {activeTab === "savedMeals" ? (
            <TabContent
              isLoading={loadingSavedMeals}
              isError={errorSavedMeals}
              isEmpty={filteredMeals.length === 0}
              errorKey="errors.loadSavedMealsFailed"
              tab="savedMeals"
              isRTL={isRTL}
            >
              <FlatList
                data={filteredMeals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SwipeDeleteRow
                    isRTL={isRTL}
                    label={t("actions.delete", {
                      defaultValue: "מחיקה",
                    })}
                    disabled={isDeletingSavedMeal}
                    onDelete={() => handleDeleteSavedMeal(item)}
                  >
                    <SavedMealCard
                      meal={item}
                      onPress={(meal: SavedMeal) =>
                        router.push(`/(app)/pantry/saved-meals/${meal.id}`)
                      }
                    />
                  </SwipeDeleteRow>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </TabContent>
          ) : null}
        </View>

        <ProductCalculatorModal
          visible={Boolean(calculatorProduct)}
          product={calculatorProduct}
          onClose={handleCloseCalculator}
        />
      </View>
    </TabScreenLayout>
  );
}

function TabContent({
  isLoading,
  isError,
  isEmpty,
  errorKey,
  tab,
  isRTL,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorKey: string;
  tab: PantryTab;
  isRTL: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text
          style={[styles.errorText, { textAlign: isRTL ? "right" : "left" }]}
        >
          {t(errorKey as Parameters<typeof t>[0])}
        </Text>
      </View>
    );
  }

  if (isEmpty) {
    return <PantryEmptyState tab={tab} />;
  }

  return <>{children}</>;
}
