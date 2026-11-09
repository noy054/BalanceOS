import { CatalogProductDetail } from "../types";

export type CatalogBasis = "per100g" | "per100ml" | "perServing";
export type FactUnit = "kcal" | "grams" | "mg";
export type FactKey = "calories" | "protein" | "carbs" | "sugar" | "fat" | "saturatedFat" | "fiber" | "sodium" | "salt";

export type CatalogFact = {
  key: FactKey;
  value: number | null;
  unit: FactUnit;
  nested: boolean;
};

const SODIUM_IN_GRAMS_PROVIDERS = new Set(["open_food_facts"]);

function known(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) ? value : null;
}

export function catalogBasis(item: CatalogProductDetail): CatalogBasis {
  if (item.nutritionBasis === "PER_SERVING" && known(item.caloriesPerServing) !== null) return "perServing";
  return item.nutritionBasis === "PER_100ML" ? "per100ml" : "per100g";
}

function sodiumMilligrams(item: CatalogProductDetail): number | null {
  const value = known(item.sodiumPer100g);
  if (value === null) return null;
  return SODIUM_IN_GRAMS_PROVIDERS.has(item.externalProvider ?? "") ? value * 1000 : value;
}

export function catalogFacts(item: CatalogProductDetail): CatalogFact[] {
  if (catalogBasis(item) === "perServing") {
    return [
      { key: "calories", value: known(item.caloriesPerServing), unit: "kcal", nested: false },
      { key: "protein", value: known(item.proteinPerServing), unit: "grams", nested: false },
      { key: "carbs", value: known(item.carbsPerServing), unit: "grams", nested: false },
      { key: "fat", value: known(item.fatPerServing), unit: "grams", nested: false },
      { key: "fiber", value: known(item.fiberPerServing), unit: "grams", nested: false },
    ];
  }
  return [
    { key: "calories", value: known(item.caloriesPer100g), unit: "kcal", nested: false },
    { key: "protein", value: known(item.proteinPer100g), unit: "grams", nested: false },
    { key: "carbs", value: known(item.carbsPer100g), unit: "grams", nested: false },
    { key: "sugar", value: known(item.sugarPer100g), unit: "grams", nested: true },
    { key: "fat", value: known(item.fatPer100g), unit: "grams", nested: false },
    { key: "saturatedFat", value: known(item.saturatedFatPer100g), unit: "grams", nested: true },
    { key: "fiber", value: known(item.fiberPer100g), unit: "grams", nested: false },
    { key: "sodium", value: sodiumMilligrams(item), unit: "mg", nested: false },
    { key: "salt", value: known(item.saltPer100g), unit: "grams", nested: false },
  ];
}

export function catalogSummary(item: CatalogProductDetail) {
  const facts = catalogFacts(item);
  const pick = (key: FactKey) => facts.find((fact) => fact.key === key) ?? { key, value: null, unit: "grams" as const, nested: false };
  return [pick("calories"), pick("protein"), pick("carbs"), pick("fat")];
}

export function formatFactValue(fact: CatalogFact): string {
  if (fact.value === null) return "";
  if (fact.unit === "kcal" || fact.unit === "mg") return String(Math.round(fact.value));
  const rounded = Math.round(fact.value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
