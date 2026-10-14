import { ProductCatalogProduct } from "../types";

export const REQUIRED_MACRO_KEYS = [
  "caloriesPer100g",
  "proteinPer100g",
  "carbsPer100g",
  "fatPer100g",
] as const;

export type RequiredMacroKey = (typeof REQUIRED_MACRO_KEYS)[number];

export function getMissingMacroKeys(product: ProductCatalogProduct): RequiredMacroKey[] {
  return REQUIRED_MACRO_KEYS.filter((key) => product[key] == null);
}

export function parseNonNegative(value: string | undefined): number | undefined {
  if (value == null || value.trim() === "") return undefined;
  const n = parseFloat(value);
  return isNaN(n) || n < 0 ? undefined : n;
}

/** Catalog value, or the user-supplied value when the catalog has none. */
export function getEffectiveMacro(
  product: ProductCatalogProduct,
  key: RequiredMacroKey,
  overrides: Partial<Record<RequiredMacroKey, string>>,
): number | null {
  return product[key] ?? parseNonNegative(overrides[key]) ?? null;
}
