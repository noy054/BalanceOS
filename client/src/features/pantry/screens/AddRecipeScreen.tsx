import { useEffect, useRef, useState } from "react";
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
  useCreateRecipe,
  useRecipe,
  useUpdateRecipe,
} from "../hooks/useRecipes";
import { usePantryProducts } from "../hooks/usePantry";
import { RecipeIngredientPickerModal } from "../components/recipes/RecipeIngredientPickerModal";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { RecipeBasicInfoCard } from "../components/recipes/RecipeBasicInfoCard";
import { RecipeIngredientsCard } from "../components/recipes/RecipeIngredientsCard";
import { ImagePickerCard } from "../components/shared/ImagePickerCard";
import { useAddRecipeForm } from "../hooks/useAddRecipeForm";
import { getDirectionStyles, useStyles } from "./styles/FormScreen.styles";
import { keyboardBehavior } from "../../../shared/components/ui/KeyboardAvoider";

type RouteParams = {
  id?: string;
  mode?: string;
};

type RecipeWithImage = {
  imageUrl?: string | null;
};

export function AddRecipeScreen() {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();

  const params = useLocalSearchParams<RouteParams>();
  const recipeId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(recipeId);

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(recipeId);
  const { data: existingRecipe, isLoading: isRecipeLoading } =
    useRecipe(recipeId);

  const [pickerSearch, setPickerSearch] = useState("");
  const { data: products = [], loadMore: loadMoreProducts } = usePantryProducts(pickerSearch);

  const form = useAddRecipeForm(existingRecipe, isEditMode);
  const hydratedRecipeImageIdRef = useRef<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!isEditMode || !existingRecipe) {
      return;
    }

    if (hydratedRecipeImageIdRef.current === existingRecipe.id) {
      return;
    }

    hydratedRecipeImageIdRef.current = existingRecipe.id;
    setImageUrl((existingRecipe as RecipeWithImage).imageUrl ?? "");
  }, [existingRecipe, isEditMode]);

  const isSaving = createRecipe.isPending || updateRecipe.isPending;

  async function handleSave() {
    if (!form.name.trim()) {
      form.setNameError(t("errors.requiredField"));
      return;
    }

    if (form.ingredients.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    if (form.validItems.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      mealType: form.mealType ?? undefined,
      items: form.validItems,
    };

    try {
      if (isEditMode) {
        await updateRecipe.mutateAsync(payload);
      } else {
        await createRecipe.mutateAsync(payload);
      }

      router.back();
    } catch {
      Alert.alert(
        "",
        isEditMode
          ? t("errors.updateRecipeFailed")
          : t("errors.saveRecipeFailed"),
      );
    }
  }

  const title = isEditMode ? t("editRecipe.title") : t("addRecipe.title");

  if (isEditMode && isRecipeLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={title} />
        <StateView variant="loading" message={t("recipe.loading")} />
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
            {isEditMode ? t("editRecipe.subtitle") : t("addRecipe.subtitle")}
          </Text>

          <ImagePickerCard
            imageUrl={imageUrl}
            isRTL={isRTL}
            title={t("recipe.imageTitle")}
            subtitle={t("recipe.imageSubtitle")}
            selectedSubtitle={t("recipe.imageSelected")}
            addLabel={t("recipe.addImage")}
            changeLabel={t("recipe.changeImage")}
            removeLabel={t("recipe.removeImage")}
            placeholderIcon="chef-hat"
            onChangeImage={setImageUrl}
            onRemoveImage={() => setImageUrl("")}
          />

          <RecipeBasicInfoCard
            name={form.name}
            description={form.description}
            mealType={form.mealType}
            nameError={form.nameError}
            isRTL={isRTL}
            onChangeName={form.setName}
            onChangeDescription={form.setDescription}
            onChangeMealType={form.setMealType}
          />

          <RecipeIngredientsCard
            ingredients={form.ingredients}
            isRTL={isRTL}
            onChangeAmount={form.updateAmount}
            onToggleUnit={form.toggleUnit}
            onRemoveIngredient={form.removeIngredient}
            onAddIngredient={() => form.setPickerVisible(true)}
          />

          {form.hasTotals ? (
            <View>
              <SectionHeader title={t("recipe.totalsSection")} />
              <NutritionTotals totals={form.liveTotals} label={t("foodCard.recipeTotal")} />
            </View>
          ) : null}
        </ScrollView>

        <StickyFooter>
          <Button
            label={
              isSaving
                ? t("recipe.saving")
                : isEditMode
                  ? t("recipe.updateButton")
                  : t("recipe.saveButton")
            }
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoidingView>

      <RecipeIngredientPickerModal
        visible={form.pickerVisible}
        products={products}
        onEndReached={loadMoreProducts}
        onSearchChange={setPickerSearch}
        onAdd={form.addIngredients}
        onClose={() => form.setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
