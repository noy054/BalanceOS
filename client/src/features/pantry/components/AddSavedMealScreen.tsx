import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useCreateSavedMeal } from "../hooks/useSavedMeals";
import { usePantryProducts } from "../hooks/usePantry";
import { useRecipes } from "../hooks/useRecipes";
import {
  ProductPickerModal,
  RecipePickerModal,
} from "../components/ProductPickerModal";
import { NutritionTotals } from "../components/NutritionTotals";
import { SavedMealBasicInfoCard } from "../components/SavedMealBasicInfoCard";
import { SavedMealItemsCard } from "../components/SavedMealItemsCard";
import { styles as formStyles } from "../components/styles/SavedMealForm.styles";
import {
  buildSavedMealPayloadItems,
  calculateSavedMealDraftTotals,
  makeSavedMealDraftKey,
  SavedMealDraftItem,
} from "../helpers/savedMealDraft";
import { MealType, PantryProduct, PantryRecipe } from "../types";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { styles } from "./styles/AddSavedMealScreen.styles";

export function AddSavedMealScreen() {
  const { t, i18n } = useTranslation("pantry");
  const isRTL = i18n.dir(i18n.language) === "rtl";

  const textDirection = {
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
  };

  const createSavedMeal = useCreateSavedMeal();
  const { data: products = [] } = usePantryProducts();
  const { data: recipes = [] } = useRecipes();

  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [items, setItems] = useState<SavedMealDraftItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [recipePickerVisible, setRecipePickerVisible] = useState(false);
  const [nameError, setNameError] = useState("");

  const liveTotals = useMemo(
    () => calculateSavedMealDraftTotals(items),
    [items],
  );

  const hasTotals = liveTotals.calories > 0;

  function addProduct(product: PantryProduct) {
    setItems((prev) => [
      ...prev,
      {
        kind: "product",
        key: makeSavedMealDraftKey(),
        product,
        grams: "",
      },
    ]);

    setProductPickerVisible(false);
  }

  function addRecipe(recipe: PantryRecipe) {
    setItems((prev) => [
      ...prev,
      {
        kind: "recipe",
        key: makeSavedMealDraftKey(),
        recipe,
        servings: "1",
      },
    ]);

    setRecipePickerVisible(false);
  }

  function updateAmount(key: string, value: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        if (item.kind === "product") {
          return {
            ...item,
            grams: value,
          };
        }

        return {
          ...item,
          servings: value,
        };
      }),
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError(t("errors.requiredField"));
      return;
    }

    if (items.length === 0) {
      Alert.alert("", t("errors.noItems"));
      return;
    }

    const validItems = buildSavedMealPayloadItems(items);

    if (validItems.length === 0) {
      Alert.alert("", t("errors.noItems"));
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
      Alert.alert("", t("errors.saveSavedMealFailed"));
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("addSavedMeal.title")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={formStyles.introCard}>
          <Text style={[formStyles.subtitle, textDirection]}>
            {t("addSavedMeal.subtitle")}
          </Text>
        </View>

        <SavedMealBasicInfoCard
          name={name}
          nameError={nameError}
          mealType={mealType}
          isRTL={isRTL}
          onChangeName={(value) => {
            setName(value);
            setNameError("");
          }}
          onChangeMealType={setMealType}
        />

        <SavedMealItemsCard
          items={items}
          isRTL={isRTL}
          onChangeAmount={updateAmount}
          onRemoveItem={removeItem}
          onAddProduct={() => setProductPickerVisible(true)}
          onAddRecipe={() => setRecipePickerVisible(true)}
        />

        {hasTotals ? (
          <View style={styles.totalsContainer}>
            <NutritionTotals
              totals={liveTotals}
              label={t("savedMeal.totalsSection")}
              variant="highlight"
            />
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            createSavedMeal.isPending && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={createSavedMeal.isPending}
        >
          <Text style={styles.saveBtnText}>
            {createSavedMeal.isPending
              ? t("savedMeal.saving")
              : t("savedMeal.saveButton")}
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
