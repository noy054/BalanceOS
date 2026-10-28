import { useEffect, useState } from "react";

import { nutritionForAmount } from "../helpers/nutrition";
import {
  defaultAmount,
  hasServing as productHasServing,
  toAmountPayload,
} from "../helpers/serving";
import { CalculatedNutrition, PantryProduct } from "../types";

export type CalculatorUnit = "grams" | "servings" | "calories";

export function useProductCalculator(product?: PantryProduct | null) {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<CalculatorUnit>("grams");
  const [calcResult, setCalcResult] = useState<CalculatedNutrition | null>(null);
  const [gramsResult, setGramsResult] = useState<number | null>(null);

  useEffect(() => {
    if (!product) return;
    const hasServing = productHasServing(product);
    setCalcResult(null);
    setGramsResult(null);
    setUnit(hasServing ? "servings" : "grams");
    setQuantity(hasServing ? defaultAmount(product, "servings") : "");
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
      const kcal100 = nutritionForAmount(product, { grams: 100 })?.calories ?? 0;
      if (kcal100 > 0) {
        const grams = (parsed / kcal100) * 100;
        setCalcResult(nutritionForAmount(product, { grams }));
        setGramsResult(Math.round(grams));
        return;
      }
      const kcalServing = product.caloriesPerServing ?? 0;
      if (kcalServing <= 0) return;
      setCalcResult(nutritionForAmount(product, { servings: parsed / kcalServing }));
      setGramsResult(null);
      return;
    }

    setGramsResult(null);
    setCalcResult(
      nutritionForAmount(
        product,
        toAmountPayload(product, parsed, unit === "servings" ? "servings" : "grams"),
      ),
    );
  }

  return { quantity, unit, calcResult, gramsResult, updateQuantity, selectUnit, calculate };
}
