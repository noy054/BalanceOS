import { useEffect, useMemo, useState } from "react";

import { CalculatorUnit, calculatorAmount, calculatorUnits } from "../helpers/calculatorAmount";
import { nutritionForAmount } from "../helpers/nutrition";
import { AmountPayload, defaultAmount } from "../helpers/serving";
import { CalculatedNutrition, PantryProduct } from "../types";

export type { CalculatorUnit } from "../helpers/calculatorAmount";

export type CalculatorResult = {
  amount: AmountPayload;
  nutrition: CalculatedNutrition;
};

function initialUnit(units: CalculatorUnit[]): CalculatorUnit {
  if (units.includes("servings")) return "servings";
  return units[0] ?? "grams";
}

export function useProductCalculator(product?: PantryProduct | null) {
  const units = useMemo(() => (product ? calculatorUnits(product) : []), [product]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<CalculatorUnit>("grams");

  useEffect(() => {
    if (!product) return;
    const next = initialUnit(calculatorUnits(product));
    setUnit(next);
    setQuantity(next === "servings" ? defaultAmount(product, "servings") : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const result = useMemo<CalculatorResult | null>(() => {
    if (!product || !units.includes(unit)) return null;
    const amount = calculatorAmount(product, parseFloat(quantity.replace(",", ".")), unit);
    const nutrition = amount ? nutritionForAmount(product, amount) : null;
    return amount && nutrition ? { amount, nutrition } : null;
  }, [product, units, quantity, unit]);

  function selectUnit(target: CalculatorUnit) {
    setUnit(target);
    setQuantity("");
  }

  return { units, quantity, unit, result, updateQuantity: setQuantity, selectUnit };
}
