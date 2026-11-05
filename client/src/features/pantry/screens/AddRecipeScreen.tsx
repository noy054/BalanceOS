import { useCallback, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { AmbientGlow } from "../../../shared/components/ui/AmbientGlow";
import { FormToneProvider } from "../../../shared/components/FormTone";
import { useCreateRecipe, useRecipe, useUpdateRecipe } from "../hooks/useRecipes";
import { usePantryProducts } from "../hooks/usePantry";
import { FOOD_ICONS } from "../hooks/useFoodCardModels";
import { RecipeIngredientPickerModal } from "../components/recipes/RecipeIngredientPickerModal";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { RecipeBasicInfoCard } from "../components/recipes/RecipeBasicInfoCard";
import { RecipeIngredientsCard } from "../components/recipes/RecipeIngredientsCard";
import { RecipeStepsCard } from "../components/recipes/RecipeStepsCard";
import { FormImageHeader } from "../components/form/FormImageHeader";
import { useAddRecipeForm } from "../hooks/useAddRecipeForm";
import { prepareFoodImage } from "../helpers/foodImage";
import { AmountUnit } from "../helpers/serving";
import { useIngredientEdit } from "../ingredientEditStore";
import { useStyles } from "./styles/FormScreen.styles";
import { keyboardBehavior } from "../../../shared/components/ui/KeyboardAvoider";

type RouteParams = {
  id?: string;
  mode?: string;
};

export function AddRecipeScreen() {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();
  const navigation = useNavigation();

  const params = useLocalSearchParams<RouteParams>();
  const recipeId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(recipeId);

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(recipeId);
  const { data: existingRecipe, isLoading: isRecipeLoading } = useRecipe(recipeId);

  const [pickerSearch, setPickerSearch] = useState("");
  const { data: products = [], loadMore: loadMoreProducts } = usePantryProducts(pickerSearch);

  const form = useAddRecipeForm(existingRecipe, isEditMode);
  const setAmountRef = useRef(form.setAmount);
  setAmountRef.current = form.setAmount;

  useFocusEffect(
    useCallback(() => {
      const edited = useIngredientEdit.getState().take("recipe");
      if (edited) setAmountRef.current(edited.key, edited.amount, edited.unit);
    }, []),
  );

  function openProductEditor(key: string, productId: string, amount: string, unit: AmountUnit) {
    router.push({
      pathname: "/(app)/pantry/[id]",
      params: { id: productId, ingredientOf: "recipe", ingredientKey: key, parentName: form.name.trim(), amount, unit },
    });
  }
  const [dragging, setDragging] = useState(false);

  const [isPreparing, setIsPreparing] = useState(false);
  const isSaving = isPreparing || createRecipe.isPending || updateRecipe.isPending;

  function handleDragActive(active: boolean) {
    setDragging(active);
    navigation.setOptions({ gestureEnabled: !active });
  }

  async function handleSave() {
    if (isSaving) return;

    if (!form.name.trim()) {
      form.setNameError(t("errors.requiredField"));
      return;
    }

    if (form.ingredients.length === 0 || form.validItems.length === 0) {
      Alert.alert("", t("errors.noIngredients"));
      return;
    }

    if (form.validItems.length < form.ingredients.length) {
      Alert.alert("", t("errors.missingAmounts"));
      return;
    }

    setIsPreparing(true);
    try {
      const image = await prepareFoodImage(form.imageUrl.trim(), existingRecipe?.imageUrl);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        imageUrl: image || (isEditMode ? null : undefined),
        mealTypes: form.mealTypes,
        items: form.validItems,
        steps: form.stepTexts,
      };
      setIsPreparing(false);

      if (isEditMode) {
        await updateRecipe.mutateAsync(payload);
      } else {
        await createRecipe.mutateAsync(payload);
      }

      router.back();
    } catch {
      setIsPreparing(false);
      Alert.alert(
        "",
        isEditMode ? t("errors.updateRecipeFailed") : t("errors.saveRecipeFailed"),
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
    <FormToneProvider tone="glass">
      <SafeAreaView style={styles.root} edges={["top"]}>
        <AmbientGlow intensity={0.3} />
        <ScreenHeader title={title} />

        <KeyboardAvoidingView style={styles.flex} behavior={keyboardBehavior}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            scrollEnabled={!dragging}
            showsVerticalScrollIndicator={false}
          >
            <FormImageHeader
              imageUrl={form.imageUrl}
              fallbackIcon={FOOD_ICONS.recipe}
              onChangeImage={form.setImageUrl}
              onRemoveImage={() => form.setImageUrl("")}
            />

            <RecipeBasicInfoCard
              name={form.name}
              description={form.description}
              mealTypes={form.mealTypes}
              nameError={form.nameError}
              isRTL={isRTL}
              autoFocus={!isEditMode}
              onChangeName={form.setName}
              onChangeDescription={form.setDescription}
              onToggleMealType={form.toggleMealType}
            />

            <RecipeIngredientsCard
              ingredients={form.ingredients}
              isRTL={isRTL}
              onOpenProduct={(ingredient) =>
                openProductEditor(ingredient.key, ingredient.product.id, ingredient.grams, ingredient.unit)
              }
              onChangeAmount={form.updateAmount}
              onToggleUnit={form.toggleUnit}
              onRemoveIngredient={form.removeIngredient}
              onAddIngredient={() => form.setPickerVisible(true)}
              onMoveIngredient={form.moveIngredient}
              onDragActiveChange={handleDragActive}
            />

            {form.hasTotals ? (
              <NutritionTotals totals={form.liveTotals} label={t("recipe.totalsSection")} />
            ) : null}

            <RecipeStepsCard
              steps={form.steps}
              onAddStep={form.addStep}
              onChangeStep={form.updateStep}
              onRemoveStep={form.removeStep}
              onMoveStep={form.moveStep}
              onDragActiveChange={handleDragActive}
            />
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
          incoming={form.incomingProduct}
          onIncomingHandled={form.clearIncomingProduct}
        />
      </SafeAreaView>
    </FormToneProvider>
  );
}
