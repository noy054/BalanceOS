import { useState } from "react";

import { calculateNutritionForGrams } from "../helpers/nutrition";
import { CalculatedNutrition, PantryProduct } from "../types";

export function useProductCalculator(product?: PantryProduct | null) {
  const [grams, setGrams] = useState("");
  const [calcResult, setCalcResult] = useState<CalculatedNutrition | null>(
    null,
  );

  function updateGrams(value: string) {
    setGrams(value);
    setCalcResult(null);
  }

  function calculate() {
    const parsedGrams = parseFloat(grams.replace(",", "."));

    if (!product || Number.isNaN(parsedGrams) || parsedGrams <= 0) {
      return;
    }

    setCalcResult(calculateNutritionForGrams(product, parsedGrams));
  }

  return {
    grams,
    calcResult,
    updateGrams,
    calculate,
  };
}
