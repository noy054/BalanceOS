import { CreatePantryProductPayload, PantryProduct } from "../types";

export type NutritionMode = "per100g" | "perServing";

export type ProductFormState = {
  name: string;
  brand: string;
  imageUrl: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
};

export type ProductFormErrors = Partial<
  Record<keyof ProductFormState | "servingSizeG", string>
>;

export const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: "",
  brand: "",
  imageUrl: "",
  caloriesPer100g: "",
  proteinPer100g: "",
  carbsPer100g: "",
  fatPer100g: "",
  fiberPer100g: "",
};

export function parseOptionalNumber(value: string): number | null {
  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return 0;
  }

  const parsedNumber = parseFloat(normalizedValue);

  if (Number.isNaN(parsedNumber) || parsedNumber < 0) {
    return null;
  }

  return parsedNumber;
}

export function toFormString(value?: number | null) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(Math.round(value * 100) / 100);
}

export function getProductFormFromProduct(product: PantryProduct) {
  const hasServingSize =
    product.servingSizeG != null && product.servingSizeG > 0;

  if (hasServingSize) {
    const servingSize = product.servingSizeG!;

    return {
      nutritionMode: "perServing" as NutritionMode,
      servingSizeG: toFormString(servingSize),
      form: {
        name: product.name ?? "",
        brand: product.brand ?? "",
        imageUrl: product.imageUrl ?? "",
        caloriesPer100g: toFormString(
          (product.caloriesPer100g * servingSize) / 100,
        ),
        proteinPer100g: toFormString(
          (product.proteinPer100g * servingSize) / 100,
        ),
        carbsPer100g: toFormString((product.carbsPer100g * servingSize) / 100),
        fatPer100g: toFormString((product.fatPer100g * servingSize) / 100),
        fiberPer100g:
          product.fiberPer100g != null
            ? toFormString((product.fiberPer100g * servingSize) / 100)
            : "",
      },
    };
  }

  return {
    nutritionMode: "per100g" as NutritionMode,
    servingSizeG: "",
    form: {
      name: product.name ?? "",
      brand: product.brand ?? "",
      imageUrl: product.imageUrl ?? "",
      caloriesPer100g: toFormString(product.caloriesPer100g),
      proteinPer100g: toFormString(product.proteinPer100g),
      carbsPer100g: toFormString(product.carbsPer100g),
      fatPer100g: toFormString(product.fatPer100g),
      fiberPer100g: toFormString(product.fiberPer100g),
    },
  };
}

type BuildPayloadArgs = {
  form: ProductFormState;
  servingSizeG: string;
  nutritionMode: NutritionMode;
  requiredFieldError: string;
  invalidNumberError: string;
};

export function buildProductPayload({
  form,
  servingSizeG,
  nutritionMode,
  requiredFieldError,
  invalidNumberError,
}: BuildPayloadArgs):
  | {
      payload: CreatePantryProductPayload & { servingSizeG?: number | null };
      errors: null;
    }
  | {
      payload: null;
      errors: ProductFormErrors;
    } {
  const errors: ProductFormErrors = {};

  if (!form.name.trim()) {
    errors.name = requiredFieldError;
  }

  const calories = parseOptionalNumber(form.caloriesPer100g);
  const protein = parseOptionalNumber(form.proteinPer100g);
  const carbs = parseOptionalNumber(form.carbsPer100g);
  const fat = parseOptionalNumber(form.fatPer100g);
  const fiber = parseOptionalNumber(form.fiberPer100g);

  if (calories === null) errors.caloriesPer100g = invalidNumberError;
  if (protein === null) errors.proteinPer100g = invalidNumberError;
  if (carbs === null) errors.carbsPer100g = invalidNumberError;
  if (fat === null) errors.fatPer100g = invalidNumberError;
  if (fiber === null) errors.fiberPer100g = invalidNumberError;

  if (nutritionMode === "perServing") {
    const servingSize = parseOptionalNumber(servingSizeG);

    if (!servingSize || servingSize <= 0) {
      errors.servingSizeG = invalidNumberError;
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      payload: null,
      errors,
    };
  }

  const basePayload = {
    name: form.name.trim(),
    brand: form.brand.trim() || undefined,
    imageUrl: form.imageUrl.trim() || undefined,
    fiberPer100g: form.fiberPer100g.trim() ? (fiber ?? 0) : undefined,
  };

  if (nutritionMode === "perServing") {
    const servingSize = parseOptionalNumber(servingSizeG)!;

    return {
      errors: null,
      payload: {
        ...basePayload,
        caloriesPer100g:
          Math.round((((calories ?? 0) * 100) / servingSize) * 100) / 100,
        proteinPer100g:
          Math.round((((protein ?? 0) * 100) / servingSize) * 100) / 100,
        carbsPer100g:
          Math.round((((carbs ?? 0) * 100) / servingSize) * 100) / 100,
        fatPer100g: Math.round((((fat ?? 0) * 100) / servingSize) * 100) / 100,
        fiberPer100g: form.fiberPer100g.trim()
          ? Math.round((((fiber ?? 0) * 100) / servingSize) * 100) / 100
          : undefined,
        servingSizeG: servingSize,
      },
    };
  }

  return {
    errors: null,
    payload: {
      ...basePayload,
      caloriesPer100g: calories ?? 0,
      proteinPer100g: protein ?? 0,
      carbsPer100g: carbs ?? 0,
      fatPer100g: fat ?? 0,
    },
  };
}
