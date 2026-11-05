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
import { FOOD_ICONS } from "../hooks/useFoodCardModels";
import {
  useCreateSavedMeal,
  useSavedMeal,
  useUpdateSavedMeal,
} from "../hooks/useSavedMeals";
import { usePantryProducts } from "../hooks/usePantry";
import { useRecipes } from "../hooks/useRecipes";
import { useAddSavedMealForm } from "../hooks/useAddSavedMealForm";
import {
  RecipePickerModal,
} from "../components/products/ProductPickerModal";
import { NutritionTotals } from "../components/nutrition/NutritionTotals";
import { SavedMealBasicInfoCard } from "../components/saved-meals/SavedMealBasicInfoCard";
import { SavedMealItemsCard } from "../components/saved-meals/SavedMealItemsCard";
import { FormImageHeader } from "../components/form/FormImageHeader";
import { useMealReturn } from "../mealReturnStore";
import { prepareFoodImage } from "../helpers/foodImage";
import { AmountUnit } from "../helpers/serving";
import { RecipeIngredientPickerModal } from "../components/recipes/RecipeIngredientPickerModal";
import { SavedMealDraftItem } from "../helpers/savedMealDraft";
import { PantryProduct } from "../types";
import { useIngredientEdit } from "../ingredientEditStore";
import { useStyles } from "./styles/FormScreen.styles";
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
  const navigation = useNavigation();
  const [dragging, setDragging] = useState(false);

  function handleDragActive(active: boolean) {
    setDragging(active);
    navigation.setOptions({ gestureEnabled: !active });
  }

  const createSavedMeal = useCreateSavedMeal();
  const updateSavedMeal = useUpdateSavedMeal(savedMealId);
  const { data: existingMeal, isLoading: isMealLoading } =
    useSavedMeal(savedMealId);

  const [pickerSearch, setPickerSearch] = useState("");
  const { data: products = [], loadMore: loadMoreProducts } = usePantryProducts(pickerSearch);
  const { data: recipes = [] } = useRecipes();

  const form = useAddSavedMealForm(existingMeal, isEditMode);
  const [incomingProduct, setIncomingProduct] = useState<PantryProduct | null>(null);
  const clearIncomingProduct = useCallback(() => setIncomingProduct(null), []);
  const openProductPickerRef = useRef(form.setProductPickerVisible);
  openProductPickerRef.current = form.setProductPickerVisible;
  const setAmountRef = useRef(form.setAmount);
  setAmountRef.current = form.setAmount;

  function openProductEditor(key: string, productId: string, amount: string, unit: AmountUnit) {
    router.push({
      pathname: "/(app)/pantry/[id]",
      params: { id: productId, ingredientOf: "savedMeal", ingredientKey: key, parentName: form.name.trim(), amount, unit },
    });
  }

  function handleEditItem(item: SavedMealDraftItem) {
    if (item.kind === "product") openProductEditor(item.key, item.product.id, item.grams, item.unit);
  }

  useFocusEffect(
    useCallback(() => {
      const pending = useMealReturn.getState().take("savedMeal");
      if (pending) {
        setIncomingProduct(pending);
        openProductPickerRef.current(true);
      }
      const edited = useIngredientEdit.getState().take("savedMeal");
      if (edited) setAmountRef.current(edited.key, edited.amount, edited.unit);
    }, []),
  );

  const [isPreparing, setIsPreparing] = useState(false);
  const isSaving = isPreparing || createSavedMeal.isPending || updateSavedMeal.isPending;

  async function handleSave() {
    if (isSaving) return;

    if (!form.name.trim()) {
      form.setNameError(t("errors.requiredField"));
      return;
    }

    if (form.items.length === 0 || form.validItems.length === 0) {
      Alert.alert("", t("errors.noItems"));
      return;
    }

    if (form.validItems.length < form.items.length) {
      Alert.alert("", t("errors.missingAmounts"));
      return;
    }

    setIsPreparing(true);
    try {
      const image = await prepareFoodImage(form.imageUrl.trim(), existingMeal?.imageUrl);
      const payload = {
        name: form.name.trim(),
        imageUrl: image || (isEditMode ? null : undefined),
        mealTypes: form.mealTypes,
        items: form.validItems,
      };
      setIsPreparing(false);

      if (isEditMode) {
        await updateSavedMeal.mutateAsync(payload);
      } else {
        await createSavedMeal.mutateAsync(payload);
      }

      router.back();
    } catch {
      setIsPreparing(false);
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
    <FormToneProvider tone="glass">
    <SafeAreaView style={styles.root} edges={["top"]}>
      <AmbientGlow intensity={0.3} />
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
          scrollEnabled={!dragging}
          showsVerticalScrollIndicator={false}
        >
          <FormImageHeader
            imageUrl={form.imageUrl}
            fallbackIcon={FOOD_ICONS.savedMeal}
            onChangeImage={form.setImageUrl}
            onRemoveImage={() => form.setImageUrl("")}
          />

          <SavedMealBasicInfoCard
            name={form.name}
            nameError={form.nameError}
            mealTypes={form.mealTypes}
            isRTL={isRTL}
            onChangeName={form.handleNameChange}
            onToggleMealType={form.toggleMealType}
          />

          <SavedMealItemsCard
            items={form.items}
            isRTL={isRTL}
            onOpenProduct={handleEditItem}
            onChangeAmount={form.updateAmount}
            onToggleUnit={form.toggleUnit}
            onRemoveItem={form.removeItem}
            onAddProduct={() => form.setProductPickerVisible(true)}
            onAddRecipe={() => form.setRecipePickerVisible(true)}
            onMoveItem={form.moveItem}
            onDragActiveChange={handleDragActive}
          />

          {form.hasTotals ? (
            <NutritionTotals totals={form.liveTotals} label={t("form.mealTotal")} />
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

      <RecipeIngredientPickerModal
        visible={form.productPickerVisible}
        products={products}
        target="savedMeal"
        onEndReached={loadMoreProducts}
        onSearchChange={setPickerSearch}
        onAdd={form.addProducts}
        onClose={() => form.setProductPickerVisible(false)}
        incoming={incomingProduct}
        onIncomingHandled={clearIncomingProduct}
      />

      <RecipePickerModal
        visible={form.recipePickerVisible}
        recipes={recipes}
        onSelect={form.addRecipe}
        onClose={() => form.setRecipePickerVisible(false)}
      />
    </SafeAreaView>
    </FormToneProvider>
  );
}
