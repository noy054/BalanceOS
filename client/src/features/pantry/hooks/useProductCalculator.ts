import { useEffect, useMemo, useState } from "react";

import {
  CalculatorUnit,
  calculatorAmount,
  calculatorUnits,
  convertCalculatorQuantity,
  defaultCalculatorQuantity,
} from "../helpers/calculatorAmount";
import { nutritionForAmount } from "../helpers/nutrition";
import { AmountPayload, AmountUnit } from "../helpers/serving";
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

export type CalculatorStart = { quantity: string; unit: AmountUnit };

export function useProductCalculator(product?: PantryProduct | null, start?: CalculatorStart | null) {
  const units = useMemo(() => (product ? calculatorUnits(product) : []), [product]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<CalculatorUnit>("grams");

  useEffect(() => {
    if (!product) return;
    const available = calculatorUnits(product);
    if (start && available.includes(start.unit) && parseFloat(start.quantity) > 0) {
      setUnit(start.unit);
      setQuantity(start.quantity);
      return;
    }
    const next = initialUnit(available);
    setUnit(next);
    setQuantity(defaultCalculatorQuantity(product, next));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const result = useMemo<CalculatorResult | null>(() => {
    if (!product || !units.includes(unit)) return null;
    const amount = calculatorAmount(product, parseFloat(quantity.replace(",", ".")), unit);
    const nutrition = amount ? nutritionForAmount(product, amount) : null;
    return amount && nutrition ? { amount, nutrition } : null;
  }, [product, units, quantity, unit]);

  function selectUnit(target: CalculatorUnit) {
    if (!product || target === unit) return;
    setQuantity(
      convertCalculatorQuantity(
        product,
        result?.amount ?? null,
        result?.nutrition.calories ?? null,
        target,
      ),
    );
    setUnit(target);
  }

  return { units, quantity, unit, result, updateQuantity: setQuantity, selectUnit };
}
