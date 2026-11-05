export const SERVING_UNIT_KEYS = ["tablespoon", "teaspoon", "cup", "slice", "unit", "package"] as const;

export type ServingUnitKey = (typeof SERVING_UNIT_KEYS)[number];

export type ServingReference = {
  unitKey: ServingUnitKey;
  quantity: number;
  grams: number;
};

export type ServingReferenceSource = {
  servingSizeG?: number | null;
  servingQuantity?: number | null;
  servingUnit?: string | null;
  servingSizeText?: string | null;
};

const UNIT_ALIASES: Record<ServingUnitKey, string[]> = {
  tablespoon: ["tbsp", "tbs", "tablespoon", "tablespoons", "כף", "כפות"],
  teaspoon: ["tsp", "teaspoon", "teaspoons", "כפית", "כפיות"],
  cup: ["cup", "cups", "כוס", "כוסות"],
  slice: ["slice", "slices", "פרוסה", "פרוסות"],
  unit: ["unit", "units", "piece", "pieces", "pc", "pcs", "יחידה", "יחידות"],
  package: ["package", "packages", "pack", "packs", "אריזה", "אריזות"],
};

const LABEL_PATTERN = /^\s*(\d+(?:[.,]\d+)?)?\s*([^\d(]+?)\s*\(\s*(\d+(?:[.,]\d+)?)\s*(?:g|gr|ג|גרם)\s*\)/i;

function toNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function servingUnitKey(text: string | null | undefined): ServingUnitKey | null {
  const words = (text ?? "")
    .toLocaleLowerCase()
    .split(/[^\p{L}]+/u)
    .filter(Boolean);
  return (
    SERVING_UNIT_KEYS.find((key) => words.some((word) => UNIT_ALIASES[key].includes(word))) ?? null
  );
}

export function servingReferences(source: ServingReferenceSource | null | undefined): ServingReference[] {
  if (!source) return [];
  const references: ServingReference[] = [];

  const unitKey = servingUnitKey(source.servingUnit);
  if (unitKey && source.servingSizeG != null && source.servingSizeG > 0) {
    references.push({
      unitKey,
      quantity: source.servingQuantity != null && source.servingQuantity > 0 ? source.servingQuantity : 1,
      grams: source.servingSizeG,
    });
  }

  const match = source.servingSizeText ? LABEL_PATTERN.exec(source.servingSizeText) : null;
  const labelKey = match ? servingUnitKey(match[2]) : null;
  const labelGrams = match ? toNumber(match[3]) : null;
  if (match && labelKey && labelGrams && !references.some((entry) => entry.unitKey === labelKey)) {
    references.push({ unitKey: labelKey, quantity: toNumber(match[1]) ?? 1, grams: labelGrams });
  }

  return references;
}
