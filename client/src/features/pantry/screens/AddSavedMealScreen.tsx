import { useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { SectionHeader } from "../../../shared/components/ui/SectionHeader";
import {
  useCreateSavedMeal,
  useSavedMeal,
  useUpdateSavedMeal,
} from "../hooks/useSavedMeals";
import { usePantryProducts } from "../hooks/usePantry";
import type { ProductCategory } from "../types";
import { useRecipes } from "../hooks/useRecipes";
import { useAddSavedMealForm } from "../hooks/useAddSavedMealForm";
import {
  ProductPickerModal,
  RecipePickerModal,
} from "../components/products/ProductPickerModal";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { SavedMealBasicInfoCard } from "../components/saved-meals/SavedMealBasicInfoCard";
import { SavedMealItemsCard } from "../components/saved-meals/SavedMealItemsCard";
import { ImagePickerCard } from "../components/shared/ImagePickerCard";
import { getDirectionStyles, useStyles } from "./styles/FormScreen.styles";
import { keyboardBehavior } from "../../../shared/components/ui/KeyboardAvoider";

type RouteParams = {
  id?: string;
  mode?: string;
};

export function AddSavedMealScreen() {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();

  const params = useLocalSearchParams<RouteParams>();
  const savedMealId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(savedMealId);

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const createSavedMeal = useCreateSavedMeal();
  const updateSavedMeal = useUpdateSavedMeal(savedMealId);
  const { data: existingMeal, isLoading: isMealLoading } =
    useSavedMeal(savedMealId);

  const [pickerSearch, setPickerSearch] = useState("");
  const { data: products = [], loadMore: loadMoreProducts } = usePantryProducts(pickerSearch);
  const { data: recipes = [] } = useRecipes();

  const form = useAddSavedMealForm(existingMeal, isEditMode);

  const mealCategory: ProductCategory | null =
    !form.mealType
      ? null
      : form.mealType === "SNACK_1" || form.mealType === "SNACK_2"
        ? "SNACK"
        : (form.mealType as ProductCategory);

  const isSaving = createSavedMeal.isPending || updateSavedMeal.isPending;

  async function handleSave() {
    if (!form.name.trim()) {
      form.setNameError(t("errors.requiredField"));
      return;
    }

    if (form.items.length === 0 || form.validItems.length === 0) {
      Alert.alert("", t("errors.noItems"));
      return;
    }

    const payload = {
      name: form.name.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      mealType: form.mealType ?? undefined,
      items: form.validItems,
    };

    try {
      if (isEditMode) {
        await updateSavedMeal.mutateAsync(payload);
      } else {
        await createSavedMeal.mutateAsync(payload);
      }

      router.back();
    } catch {
      Alert.alert(
        "",
        isEditMode
          ? t("errors.updateSavedMealFailed")
          : t("errors.saveSavedMealFailed"),
      );
    }
  }

  const title = isEditMode ? t("editSavedMeal.title") : t("addSavedMeal.title");

  if (isEditMode && isMealLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={title} />
        <StateView variant="loading" message={t("savedMeal.loading")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={title} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={keyboardBehavior}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.intro, dir.text]}>
            {isEditMode ? t("editSavedMeal.subtitle") : t("addSavedMeal.subtitle")}
          </Text>

          <ImagePickerCard
            imageUrl={form.imageUrl}
            isRTL={isRTL}
            title={t("savedMeal.imageTitle")}
            subtitle={t("savedMeal.imageSubtitle")}
            selectedSubtitle={t("savedMeal.imageSelected")}
            addLabel={t("savedMeal.addImage")}
            changeLabel={t("savedMeal.changeImage")}
            removeLabel={t("savedMeal.removeImage")}
            placeholderIcon="silverware-fork-knife"
            onChangeImage={form.setImageUrl}
            onRemoveImage={() => form.setImageUrl("")}
          />

          <SavedMealBasicInfoCard
            name={form.name}
            nameError={form.nameError}
            mealType={form.mealType}
            isRTL={isRTL}
            onChangeName={form.handleNameChange}
            onChangeMealType={form.setMealType}
          />

          <SavedMealItemsCard
            items={form.items}
            isRTL={isRTL}
            onChangeAmount={form.updateAmount}
            onToggleUnit={form.toggleUnit}
            onRemoveItem={form.removeItem}
            onAddProduct={() => form.setProductPickerVisible(true)}
            onAddRecipe={() => form.setRecipePickerVisible(true)}
          />

          {form.hasTotals ? (
            <View>
              <SectionHeader title={t("savedMeal.totalsSection")} />
              <NutritionTotals totals={form.liveTotals} label={t("foodCard.mealTotal")} />
            </View>
          ) : null}
        </ScrollView>

        <StickyFooter>
          <Button
            label={
              isSaving
                ? t("savedMeal.saving")
                : isEditMode
                  ? t("savedMeal.updateButton")
                  : t("savedMeal.saveButton")
            }
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoidingView>

      <ProductPickerModal
        visible={form.productPickerVisible}
        products={products}
        onEndReached={loadMoreProducts}
        onSearchChange={setPickerSearch}
        selectedIds={form.selectedProductIds}
        mealCategory={mealCategory}
        onSelect={form.addProduct}
        onClose={() => form.setProductPickerVisible(false)}
      />

      <RecipePickerModal
        visible={form.recipePickerVisible}
        recipes={recipes}
        onSelect={form.addRecipe}
        onClose={() => form.setRecipePickerVisible(false)}
      />
    </SafeAreaView>
  );
}
