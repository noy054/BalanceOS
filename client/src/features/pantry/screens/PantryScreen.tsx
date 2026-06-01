import { useMemo, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { PantryHeader } from "../components/PantryHeader";
import { PantrySearchBar } from "../components/PantrySearchBar";
import { PantryTabBar } from "../components/PantryTabBar";
import { ProductCard } from "../components/ProductCard";
import { RecipeCard } from "../components/RecipeCard";
import { SavedMealCard } from "../components/SavedMealCard";
import { PantryEmptyState } from "../components/PantryEmptyState";
import { BottomTabBar } from "../../../shared/components/BottomTabBar";
import { usePantryProducts } from "../hooks/usePantry";
import { useRecipes } from "../hooks/useRecipes";
import { useSavedMeals } from "../hooks/useSavedMeals";
import { PantryProduct, PantryRecipe, PantryTab, SavedMeal } from "../types";
import { colors } from "../../../shared/theme";
import { styles, getDirectionStyles } from "./styles/PantryScreen.styles";

export function PantryScreen() {
  const { t, i18n } = useTranslation("pantry");

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PantryTab>("products");

  const {
    data: products = [],
    isLoading: loadingProducts,
    isError: errorProducts,
  } = usePantryProducts();

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

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    const q = search.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;

    const q = search.toLowerCase();

    return recipes.filter((recipe) => recipe.name.toLowerCase().includes(q));
  }, [recipes, search]);

  const filteredMeals = useMemo(() => {
    if (!search.trim()) return savedMeals;

    const q = search.toLowerCase();

    return savedMeals.filter((meal) => meal.name.toLowerCase().includes(q));
  }, [savedMeals, search]);

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

  function addLabel() {
    if (activeTab === "products") return t("actions.addProduct");
    if (activeTab === "recipes") return t("actions.addRecipe");

    return t("actions.addSavedMeal");
  }

  return (
    <SafeAreaView
      key={i18n.language}
      style={styles.root}
      edges={["top"]}
    >
      <PantryHeader />

      <View style={styles.searchRow}>
        <PantrySearchBar value={search} onChangeText={setSearch} />
      </View>

      <View style={[styles.actionsRow, dir.row]}>
        <Pressable
          style={[styles.actionBtn, dir.row]}
          onPress={handleAdd}
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={colors.cardBackground}
          />

          <Text style={[styles.actionBtnText, dir.text]}>
            {addLabel()}
          </Text>
        </Pressable>

        {activeTab === "products" ? (
          <Pressable
            style={[
              styles.actionBtn,
              dir.row,
              styles.actionBtnOutline,
            ]}
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
        {activeTab === "products" && (
          <TabContent
            isLoading={loadingProducts}
            isError={errorProducts}
            isEmpty={filteredProducts.length === 0}
            errorKey="errors.loadFailed"
            tab="products"
            isRTL={isRTL}
          >
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={(product: PantryProduct) =>
                    router.push(`/(app)/pantry/${product.id}`)
                  }
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </TabContent>
        )}

        {activeTab === "recipes" && (
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
                <RecipeCard
                  recipe={item}
                  onPress={(recipe: PantryRecipe) =>
                    router.push(`/(app)/pantry/recipes/${recipe.id}`)
                  }
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </TabContent>
        )}

        {activeTab === "savedMeals" && (
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
                <SavedMealCard
                  meal={item}
                  onPress={(meal: SavedMeal) =>
                    router.push(`/(app)/pantry/saved-meals/${meal.id}`)
                  }
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </TabContent>
        )}
      </View>

      <BottomTabBar activeTab="pantry" />
    </SafeAreaView>
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
  children: React.ReactNode;
}) {
  const { t } = useTranslation("pantry");

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
        <Text style={[styles.errorText, { textAlign: isRTL ? "right" : "left" }]}>
          {t(errorKey as Parameters<typeof t>[0])}
        </Text>
      </View>
    );
  }

  if (isEmpty) return <PantryEmptyState tab={tab} />;

  return <>{children}</>;
}
