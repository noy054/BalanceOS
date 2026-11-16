import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useRecipeReturn } from "../recipeReturnStore";
import { MealType, PantryProduct, PantryRecipe } from "../types";
import {
  buildRecipePayloadItems,
  calculateRecipeDraftTotals,
  createRecipeDraftFromRecipeItem,
  createRecipeDraftFromSelection,
  hasRecipeDraftTotals,
  RecipeIngredientDraft,
  RecipeIngredientSelectionInput,
} from "../helpers/recipeDraft";
import { convertAmount, AmountUnit, nextAmountUnit } from "../helpers/serving";
import { moveItem, recipeMealTypes } from "../helpers/recipeMealTypes";
import { MEAL_TYPES } from "../constants";

export type RecipeStepDraft = {
  key: string;
  text: string;
};

let stepSeed = 0;

function createStep(text = ""): RecipeStepDraft {
  stepSeed += 1;
  return { key: `step-${Date.now()}-${stepSeed}`, text };
}

export function useAddRecipeForm(
  existingRecipe?: PantryRecipe,
  isEditMode = false,
) {
  const [name, setNameValue] = useState("");
  const [description, setDescription] = useState("");
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([]);
  const [steps, setSteps] = useState<RecipeStepDraft[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [incomingProduct, setIncomingProduct] = useState<PantryProduct | null>(null);
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
    setMealTypes(recipeMealTypes(existingRecipe));
    setImageUrl(existingRecipe.imageUrl ?? "");
    setSteps((existingRecipe.steps ?? []).map((text) => createStep(text)));
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

        setIncomingProduct(pendingProduct);
        setPickerVisible(true);
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

  const clearIncomingProduct = useCallback(() => setIncomingProduct(null), []);

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

  function setIngredientWeight(key: string, weightG: string) {
    setIngredients((prev) =>
      prev.map((ingredient) => (ingredient.key === key ? { ...ingredient, weightG } : ingredient)),
    );
  }

  function setAmount(key: string, amount: string, unit: AmountUnit) {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, grams: amount, unit } : ingredient,
      ),
    );
  }

  function toggleUnit(key: string) {
    setIngredients((prev) =>
      prev.map((ingredient) => {
        if (ingredient.key !== key) {
          return ingredient;
        }

        const nextUnit = nextAmountUnit(ingredient.product, ingredient.unit);

        return {
          ...ingredient,
          unit: nextUnit,
          grams: convertAmount(ingredient.product, ingredient.grams, ingredient.unit, nextUnit),
        };
      }),
    );
  }

  function toggleMealType(type: MealType) {
    setMealTypes((prev) =>
      MEAL_TYPES.filter((entry) => (entry === type ? !prev.includes(type) : prev.includes(entry))),
    );
  }

  function moveIngredient(from: number, to: number) {
    setIngredients((prev) => moveItem(prev, from, to));
  }

  function addStep() {
    setSteps((prev) => [...prev, createStep()]);
  }

  function updateStep(key: string, text: string) {
    setSteps((prev) => prev.map((step) => (step.key === key ? { ...step, text } : step)));
  }

  function removeStep(key: string) {
    setSteps((prev) => prev.filter((step) => step.key !== key));
  }

  function moveStep(from: number, to: number) {
    setSteps((prev) => moveItem(prev, from, to));
  }

  const stepTexts = steps.map((step) => step.text.trim()).filter(Boolean);

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
    mealTypes,
    toggleMealType,
    imageUrl,
    setImageUrl,
    ingredients,
    setIngredients,
    pickerVisible,
    setPickerVisible,
    incomingProduct,
    clearIncomingProduct,
    nameError,
    setNameError,
    liveTotals,
    hasTotals,
    validItems,
    addIngredients,
    updateAmount,
    setAmount,
    setIngredientWeight,
    toggleUnit,
    removeIngredient,
    moveIngredient,
    steps,
    stepTexts,
    addStep,
    updateStep,
    removeStep,
    moveStep,
  };
}
