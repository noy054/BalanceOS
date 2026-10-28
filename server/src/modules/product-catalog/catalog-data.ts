import { Prisma } from '../../../generated/prisma/client';
import { NutritionBasis } from '../../../generated/prisma/enums';
import {
  NUTRITION_FIELD_KEYS,
  ProductNutritionFields,
  pickNutritionFields,
} from '../pantry/product-nutrition.normalizer';
import { NutrientMap } from './types/external-product.types';

export type CatalogProductData = ProductNutritionFields & {
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null;
  nutrients: NutrientMap | null;
};

type ProductLikeRow = Partial<Record<keyof ProductNutritionFields, unknown>> & {
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl?: string | null;
  nutrients?: Prisma.JsonValue | null;
};

type CatalogLikeRow = Omit<ProductLikeRow, 'servingSizeG'> & {
  servingSizeGrams: number | null;
};

export function isShareableImage(url: string | null | undefined): boolean {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export function toNutrientMap(
  value: Prisma.JsonValue | null | undefined,
): NutrientMap | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result: NutrientMap = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'number' && Number.isFinite(entry)) {
      result[key] = entry;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

export function fromProductRow(row: ProductLikeRow): CatalogProductData {
  return {
    ...pickNutritionFields(row),
    name: row.name,
    brand: row.brand ?? null,
    barcode: row.barcode ?? null,
    imageUrl: row.imageUrl ?? null,
    nutrients: toNutrientMap(row.nutrients),
  };
}

export function fromCatalogRow(row: CatalogLikeRow): CatalogProductData {
  return fromProductRow({ ...row, servingSizeG: row.servingSizeGrams });
}

export function parseCatalogData(
  value: Prisma.JsonValue,
): CatalogProductData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, Prisma.JsonValue>;
  if (typeof record.name !== 'string') return null;
  const text = (key: string) =>
    typeof record[key] === 'string' ? (record[key] as string) : null;
  const nutrition: Record<string, unknown> = {};
  for (const key of NUTRITION_FIELD_KEYS) {
    const entry = record[key];
    if (key === 'nutritionBasis') {
      nutrition[key] =
        entry === NutritionBasis.PER_SERVING
          ? NutritionBasis.PER_SERVING
          : NutritionBasis.PER_100G;
    } else if (key === 'servingUnit' || key === 'servingSizeText') {
      nutrition[key] = typeof entry === 'string' ? entry : null;
    } else {
      nutrition[key] = typeof entry === 'number' ? entry : null;
    }
  }
  return {
    ...pickNutritionFields(nutrition),
    name: record.name,
    brand: text('brand'),
    barcode: text('barcode'),
    imageUrl: text('imageUrl'),
    nutrients: toNutrientMap(record.nutrients),
  };
}

function sameNumber(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < 0.05;
}

function sameText(a: string | null, b: string | null): boolean {
  return (
    (a?.trim().toLowerCase() || null) === (b?.trim().toLowerCase() || null)
  );
}

export function catalogDataDiffers(
  proposed: CatalogProductData,
  current: CatalogProductData,
): boolean {
  if (!sameText(proposed.name, current.name)) return true;
  if (!sameText(proposed.brand, current.brand)) return true;
  if (
    isShareableImage(proposed.imageUrl) &&
    proposed.imageUrl !== current.imageUrl
  ) {
    return true;
  }
  for (const key of NUTRITION_FIELD_KEYS) {
    const a = proposed[key];
    const b = current[key];
    if (typeof a === 'number' || typeof b === 'number') {
      if (!sameNumber(a as number | null, b as number | null)) return true;
    } else if (!sameText(a as string | null, b as string | null)) {
      return true;
    }
  }
  return false;
}

export function toJson(data: CatalogProductData): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonObject;
}
