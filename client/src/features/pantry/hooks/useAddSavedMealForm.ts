import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildSavedMealPayloadItems,
  calculateSavedMealDraftTotals,
  createSavedMealDraftFromProduct,
  createSavedMealDraftFromRecipe,
  createSavedMealDraftFromSavedMealItem,
  parsePositiveNumber,
  SavedMealDraftItem,
} from "../helpers/savedMealDraft";
import { MealType, PantryProduct, PantryRecipe, SavedMeal } from "../types";
import { MEAL_TYPES } from "../constants";
import { convertAmount } from "../helpers/serving";

export function useAddSavedMealForm(
  existingMeal: SavedMeal | undefined,
  isEditMode: boolean,
) {
  const hydratedMealIdRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [items, setItems] = useState<SavedMealDraftItem[]>([]);
  const [nameError, setNameError] = useState("");
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [recipePickerVisible, setRecipePickerVisible] = useState(false);

  useEffect(() => {
    if (!isEditMode || !existingMeal) {
      return;
    }

    if (hydratedMealIdRef.current === existingMeal.id) {
      return;
    }

    hydratedMealIdRef.current = existingMeal.id;

    setName(existingMeal.name);
    setImageUrl(existingMeal.imageUrl ?? "");
    setMealTypes(
      MEAL_TYPES.filter((type) => existingMeal.mealTypes.includes(type)),
    );
    setNameError("");

    setItems(
      existingMeal.items
        .map((item) => createSavedMealDraftFromSavedMealItem(item))
        .filter((item): item is SavedMealDraftItem => item !== null),
    );
  }, [existingMeal, isEditMode]);

  const liveTotals = useMemo(
    () => calculateSavedMealDraftTotals(items),
    [items],
  );

  const hasTotals = useMemo(
    () =>
      items.some((item) =>
        item.kind === "product"
          ? parsePositiveNumber(item.grams) !== null
          : parsePositiveNumber(item.servings) !== null,
      ),
    [items],
  );

  const selectedProductIds = useMemo(
    () =>
      items
        .filter((item) => item.kind === "product")
        .map((item) => item.product.id),
    [items],
  );

  const validItems = useMemo(() => buildSavedMealPayloadItems(items), [items]);

  function handleNameChange(value: string) {
    setName(value);
    setNameError("");
  }

  function addProduct(product: PantryProduct) {
    setItems((prev) => [...prev, createSavedMealDraftFromProduct(product)]);
    setProductPickerVisible(false);
  }

  function addRecipe(recipe: PantryRecipe) {
    setItems((prev) => [...prev, createSavedMealDraftFromRecipe(recipe)]);
    setRecipePickerVisible(false);
  }

  function updateAmount(key: string, value: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) {
          return item;
        }

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

  function toggleUnit(key: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key || item.kind !== "product") {
          return item;
        }

        const nextUnit = item.unit === "grams" ? "servings" : "grams";

        return {
          ...item,
          unit: nextUnit,
          grams: convertAmount(item.product, item.grams, item.unit, nextUnit),
        };
      }),
    );
  }

  function toggleMealType(type: MealType) {
    setMealTypes((prev) =>
      prev.includes(type)
        ? prev.filter((value) => value !== type)
        : MEAL_TYPES.filter((value) => value === type || prev.includes(value)),
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  return {
    name,
    imageUrl,
    mealTypes,
    items,
    nameError,
    productPickerVisible,
    recipePickerVisible,
    liveTotals,
    toggleUnit,
    hasTotals,
    selectedProductIds,
    validItems,

    setNameError,
    setImageUrl,
    toggleMealType,
    setProductPickerVisible,
    setRecipePickerVisible,

    handleNameChange,
    addProduct,
    addRecipe,
    updateAmount,
    removeItem,
  };
}
