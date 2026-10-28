import { ProductNutritionFields, ProductNutritionPayload } from "../types";

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

export type ServingFormState = {
  quantity: string;
  unit: string;
  grams: string;
};

export type ProductFormErrors = Partial<
  Record<keyof ProductFormState | "servingSizeG" | "servingQuantity", string>
>;

export type ProductFormSource = ProductNutritionFields & {
  name: string;
  brand: string | null;
  imageUrl?: string | null;
};

export type ProductFormPayload = ProductNutritionPayload & {
  name: string;
  brand: string | null;
  imageUrl: string | null;
};

export const INITIAL_SERVING_FORM: ServingFormState = {
  quantity: "1",
  unit: "",
  grams: "",
};

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

function scaled(value: number | null | undefined, factor: number) {
  return value == null ? null : value * factor;
}

export function getProductFormFromProduct(
  product: ProductFormSource,
  options: { preferPer100g?: boolean } = {},
) {
  const grams = product.servingSizeG != null && product.servingSizeG > 0 ? product.servingSizeG : null;
  const unit = product.servingUnit?.trim() ?? "";
  const isPerServing = product.nutritionBasis === "PER_SERVING";

  const serving: ServingFormState =
    grams || isPerServing
      ? {
          quantity: toFormString(product.servingQuantity ?? 1) || "1",
          unit,
          grams: toFormString(grams),
        }
      : INITIAL_SERVING_FORM;

  const identity = {
    name: product.name ?? "",
    brand: product.brand ?? "",
    imageUrl: product.imageUrl ?? "",
  };

  if (isPerServing) {
    return {
      nutritionMode: "perServing" as NutritionMode,
      serving,
      form: {
        ...identity,
        caloriesPer100g: toFormString(product.caloriesPerServing),
        proteinPer100g: toFormString(product.proteinPerServing),
        carbsPer100g: toFormString(product.carbsPerServing),
        fatPer100g: toFormString(product.fatPerServing),
        fiberPer100g: toFormString(product.fiberPerServing),
      },
    };
  }

  if (grams && !options.preferPer100g) {
    const factor = grams / 100;
    return {
      nutritionMode: "perServing" as NutritionMode,
      serving,
      form: {
        ...identity,
        caloriesPer100g: toFormString(scaled(product.caloriesPer100g, factor)),
        proteinPer100g: toFormString(scaled(product.proteinPer100g, factor)),
        carbsPer100g: toFormString(scaled(product.carbsPer100g, factor)),
        fatPer100g: toFormString(scaled(product.fatPer100g, factor)),
        fiberPer100g: toFormString(scaled(product.fiberPer100g, factor)),
      },
    };
  }

  return {
    nutritionMode: "per100g" as NutritionMode,
    serving,
    form: {
      ...identity,
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
  serving: ServingFormState;
  nutritionMode: NutritionMode;
  requireCoreValues?: boolean;
  requiredFieldError: string;
  invalidNumberError: string;
};

type ParsedServing = {
  grams: number | null;
  quantity: number | null;
  unit: string | null;
};

function parseServing(
  serving: ServingFormState,
  nutritionMode: NutritionMode,
  invalidNumberError: string,
  errors: ProductFormErrors,
): ParsedServing {
  const unit = serving.unit.trim() || null;
  const hasWeight = Boolean(serving.grams.trim());
  const perServing = nutritionMode === "perServing";
  const empty = { grams: null, quantity: null, unit: null };

  if (!perServing && !hasWeight && !unit) {
    return empty;
  }

  let grams: number | null = null;

  if (hasWeight) {
    const parsed = parseOptionalNumber(serving.grams);
    if (!parsed || parsed <= 0) {
      errors.servingSizeG = invalidNumberError;
      return empty;
    }
    grams = parsed;
  } else if (!perServing) {
    errors.servingSizeG = invalidNumberError;
    return empty;
  }

  if (!unit && !perServing) {
    return { grams, quantity: null, unit: null };
  }

  const quantity = serving.quantity.trim() ? parseOptionalNumber(serving.quantity) : 1;

  if (!quantity || quantity <= 0) {
    errors.servingQuantity = invalidNumberError;
    return empty;
  }

  return { grams, quantity, unit };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildProductPayload({
  form,
  serving,
  nutritionMode,
  requireCoreValues = false,
  requiredFieldError,
  invalidNumberError,
}: BuildPayloadArgs):
  | { payload: ProductFormPayload; errors: null }
  | { payload: null; errors: ProductFormErrors } {
  const errors: ProductFormErrors = {};

  if (!form.name.trim()) {
    errors.name = requiredFieldError;
  }

  const coreKeys = ["caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g"] as const;

  if (requireCoreValues) {
    for (const key of coreKeys) {
      if (!form[key].trim()) errors[key] = requiredFieldError;
    }
  }

  const calories = parseOptionalNumber(form.caloriesPer100g);
  const protein = parseOptionalNumber(form.proteinPer100g);
  const carbs = parseOptionalNumber(form.carbsPer100g);
  const fat = parseOptionalNumber(form.fatPer100g);
  const fiber = form.fiberPer100g.trim() ? parseOptionalNumber(form.fiberPer100g) : null;

  if (calories === null) errors.caloriesPer100g = invalidNumberError;
  if (protein === null) errors.proteinPer100g = invalidNumberError;
  if (carbs === null) errors.carbsPer100g = invalidNumberError;
  if (fat === null) errors.fatPer100g = invalidNumberError;
  if (form.fiberPer100g.trim() && fiber === null) errors.fiberPer100g = invalidNumberError;

  const parsedServing = parseServing(serving, nutritionMode, invalidNumberError, errors);

  if (Object.keys(errors).length > 0) {
    return { payload: null, errors };
  }

  const identity = {
    name: form.name.trim(),
    brand: form.brand.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
  };

  const servingFields = {
    servingSizeG: parsedServing.grams,
    servingQuantity: parsedServing.quantity,
    servingUnit: parsedServing.unit,
  };

  const emptyPerServing = {
    caloriesPerServing: null,
    proteinPerServing: null,
    carbsPerServing: null,
    fatPerServing: null,
    fiberPerServing: null,
  };

  if (nutritionMode === "perServing" && parsedServing.grams) {
    const factor = 100 / parsedServing.grams;
    return {
      errors: null,
      payload: {
        ...identity,
        ...servingFields,
        ...emptyPerServing,
        nutritionBasis: "PER_100G",
        caloriesPer100g: round2((calories ?? 0) * factor),
        proteinPer100g: round2((protein ?? 0) * factor),
        carbsPer100g: round2((carbs ?? 0) * factor),
        fatPer100g: round2((fat ?? 0) * factor),
        fiberPer100g: fiber != null ? round2(fiber * factor) : null,
      },
    };
  }

  if (nutritionMode === "perServing") {
    return {
      errors: null,
      payload: {
        ...identity,
        ...servingFields,
        nutritionBasis: "PER_SERVING",
        caloriesPer100g: null,
        proteinPer100g: null,
        carbsPer100g: null,
        fatPer100g: null,
        fiberPer100g: null,
        caloriesPerServing: calories ?? 0,
        proteinPerServing: protein ?? 0,
        carbsPerServing: carbs ?? 0,
        fatPerServing: fat ?? 0,
        fiberPerServing: fiber,
      },
    };
  }

  return {
    errors: null,
    payload: {
      ...identity,
      ...servingFields,
      ...emptyPerServing,
      nutritionBasis: "PER_100G",
      caloriesPer100g: calories ?? 0,
      proteinPer100g: protein ?? 0,
      carbsPer100g: carbs ?? 0,
      fatPer100g: fat ?? 0,
      fiberPer100g: fiber,
    },
  };
}
