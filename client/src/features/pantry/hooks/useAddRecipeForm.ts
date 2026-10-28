import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useRecipeReturn } from "../recipeReturnStore";
import { MealType, PantryRecipe } from "../types";
import {
  buildRecipePayloadItems,
  calculateRecipeDraftTotals,
  createRecipeDraftFromProduct,
  createRecipeDraftFromRecipeItem,
  createRecipeDraftFromSelection,
  hasRecipeDraftTotals,
  RecipeIngredientDraft,
  RecipeIngredientSelectionInput,
} from "../helpers/recipeDraft";
import { convertAmount } from "../helpers/serving";

export function useAddRecipeForm(
  existingRecipe?: PantryRecipe,
  isEditMode = false,
) {
  const [name, setNameValue] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [nameError, setNameError] = useState("");

  const hydratedRecipeIdRef = useRef<string | null>(null);

  const pendingProduct = useRecipeReturn((state) => state.pendingProduct);
  const clearPending = useRecipeReturn((state) => state.clearPending);
  const reopenPicker = useRecipeReturn((state) => state.reopenPicker);
  const setReopenPicker = useRecipeReturn((state) => state.setReopenPicker);
  const setRecipeFormMounted = useRecipeReturn((state) => state.setRecipeFormMounted);

  useEffect(() => {
    if (!isEditMode || !existingRecipe) {
      return;
    }

    if (hydratedRecipeIdRef.current === existingRecipe.id) {
      return;
    }

    hydratedRecipeIdRef.current = existingRecipe.id;

    setNameValue(existingRecipe.name);
    setDescription(existingRecipe.description ?? "");
    setMealType((existingRecipe.mealType as MealType | null) ?? null);
    setNameError("");

    setIngredients(
      existingRecipe.items
        .map((item) => createRecipeDraftFromRecipeItem(item))
        .filter((item): item is RecipeIngredientDraft => item !== null),
    );
  }, [existingRecipe, isEditMode]);

  useEffect(() => {
    setRecipeFormMounted(true);
    return () => {
      clearPending();
      setRecipeFormMounted(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    useCallback(() => {
      if (pendingProduct) {
        clearPending();

        setIngredients((prev) => [
          ...prev,
          createRecipeDraftFromProduct(pendingProduct),
        ]);
      }

      if (reopenPicker) {
        setReopenPicker(false);
        setPickerVisible(true);
      }
    }, [pendingProduct, clearPending, reopenPicker, setReopenPicker]),
  );

  const liveTotals = useMemo(
    () => calculateRecipeDraftTotals(ingredients),
    [ingredients],
  );

  const hasTotals = useMemo(
    () => hasRecipeDraftTotals(ingredients),
    [ingredients],
  );

  const validItems = useMemo(
    () => buildRecipePayloadItems(ingredients),
    [ingredients],
  );

  function setName(value: string) {
    setNameValue(value);
    setNameError("");
  }

  function addIngredients(items: RecipeIngredientSelectionInput[]) {
    setIngredients((prev) => [
      ...prev,
      ...items.map(createRecipeDraftFromSelection),
    ]);
  }

  function updateAmount(key: string, value: string) {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.key === key
          ? {
              ...ingredient,
              grams: value,
            }
          : ingredient,
      ),
    );
  }

  function toggleUnit(key: string) {
    setIngredients((prev) =>
      prev.map((ingredient) => {
        if (ingredient.key !== key) {
          return ingredient;
        }

        const nextUnit = ingredient.unit === "grams" ? "servings" : "grams";

        return {
          ...ingredient,
          unit: nextUnit,
          grams: convertAmount(ingredient.product, ingredient.grams, ingredient.unit, nextUnit),
        };
      }),
    );
  }

  function removeIngredient(key: string) {
    setIngredients((prev) =>
      prev.filter((ingredient) => ingredient.key !== key),
    );
  }

  return {
    name,
    setName,
    description,
    setDescription,
    mealType,
    setMealType,
    ingredients,
    setIngredients,
    pickerVisible,
    setPickerVisible,
    nameError,
    setNameError,
    liveTotals,
    hasTotals,
    validItems,
    addIngredients,
    updateAmount,
    toggleUnit,
    removeIngredient,
  };
}
