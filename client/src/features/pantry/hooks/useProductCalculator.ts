import { useEffect, useState } from "react";

import { calculateNutritionForGrams } from "../helpers/nutrition";
import { CalculatedNutrition, PantryProduct } from "../types";

export type CalculatorUnit = "grams" | "servings" | "calories";

export function useProductCalculator(product?: PantryProduct | null) {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<CalculatorUnit>("grams");
  const [calcResult, setCalcResult] = useState<CalculatedNutrition | null>(null);
  const [gramsResult, setGramsResult] = useState<number | null>(null);

  useEffect(() => {
    if (!product) return;
    const hasServing = product.servingSizeG != null && product.servingSizeG > 0;
    setCalcResult(null);
    setGramsResult(null);
    setUnit(hasServing ? "servings" : "grams");
    setQuantity(hasServing ? "1" : "");
  // Re-init only when the product itself changes, not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  function updateQuantity(value: string) {
    setQuantity(value);
    setCalcResult(null);
    setGramsResult(null);
  }

  function selectUnit(target: CalculatorUnit) {
    setUnit(target);
    setQuantity("");
    setCalcResult(null);
    setGramsResult(null);
  }

  function calculate() {
    const parsed = parseFloat(quantity.replace(",", "."));
    if (!product || Number.isNaN(parsed) || parsed <= 0) return;

    if (unit === "calories") {
      if (product.caloriesPer100g <= 0) return;
      const grams = (parsed / product.caloriesPer100g) * 100;
      setCalcResult(calculateNutritionForGrams(product, grams));
      setGramsResult(Math.round(grams));
      return;
    }

    const grams =
      unit === "servings" && product.servingSizeG != null && product.servingSizeG > 0
        ? parsed * product.servingSizeG
        : parsed;

    setGramsResult(null);
    setCalcResult(calculateNutritionForGrams(product, grams));
  }

  return { quantity, unit, calcResult, gramsResult, updateQuantity, selectUnit, calculate };
}
