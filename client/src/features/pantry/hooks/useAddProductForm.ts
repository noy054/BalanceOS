import { useEffect, useRef, useState } from "react";

import { formatAmount } from "../helpers/serving";

import { ProductCategory } from "../types";
import {
  buildProductPayload,
  getProductFormFromProduct,
  INITIAL_PRODUCT_FORM,
  INITIAL_SERVING_FORM,
  NutritionMode,
  ProductFormErrors,
  ProductFormSource,
  ProductFormState,
  ServingFormState,
} from "../helpers/productForm";

export type ProductFormPrefill = ProductFormSource & {
  id: string;
  mealCategories?: ProductCategory[];
};

type Args = {
  source?: ProductFormPrefill | null;
  requireCoreValues?: boolean;
  preferPer100g?: boolean;
  requiredFieldError: string;
  invalidNumberError: string;
};

function parseNumber(value: string) {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const NUTRIENT_KEYS = ["caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "fiberPer100g"] as const;

type NutrientKey = (typeof NUTRIENT_KEYS)[number];

type NutritionBaseline = {
  unit: "grams" | "milliliters";
  form: ProductFormState;
};

const EMPTY_NUTRIENTS: Pick<ProductFormState, NutrientKey> = {
  caloriesPer100g: "",
  proteinPer100g: "",
  carbsPer100g: "",
  fatPer100g: "",
  fiberPer100g: "",
};

function nutrientsOf(form: ProductFormState): Pick<ProductFormState, NutrientKey> {
  return {
    caloriesPer100g: form.caloriesPer100g,
    proteinPer100g: form.proteinPer100g,
    carbsPer100g: form.carbsPer100g,
    fatPer100g: form.fatPer100g,
    fiberPer100g: form.fiberPer100g,
  };
}

function hasNutrients(form: ProductFormState) {
  return NUTRIENT_KEYS.some((key) => form[key].trim() !== "");
}

function numberText(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function isNutrientKey(key: keyof ProductFormState): key is NutrientKey {
  return (NUTRIENT_KEYS as readonly string[]).includes(key);
}

export function useAddProductForm({
  source,
  requireCoreValues = false,
  preferPer100g = false,
  requiredFieldError,
  invalidNumberError,
}: Args) {
  const hydratedIdRef = useRef<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [nutritionMode, setNutritionMode] = useState<NutritionMode>("per100g");
  const [serving, setServing] = useState<ServingFormState>(INITIAL_SERVING_FORM);
  const [mealCategories, setMealCategories] = useState<ProductCategory[]>([]);
  const [scaledBy, setScaledBy] = useState<number | null>(null);
  const linkedStart = useRef<{ form: ProductFormState; serving: ServingFormState } | null>(null);
  const baseline = useRef<NutritionBaseline | null>(null);

  useEffect(() => {
    if (!source || hydratedIdRef.current === source.id) {
      return;
    }

    hydratedIdRef.current = source.id;
    const productForm = getProductFormFromProduct(source, { preferPer100g });

    baseline.current =
      productForm.nutritionMode === "perServing" && source.nutritionBasis !== "PER_SERVING" && source.caloriesPer100g != null
        ? {
            unit: "grams",
            form: {
              ...productForm.form,
              caloriesPer100g: numberText(source.caloriesPer100g),
              proteinPer100g: numberText(source.proteinPer100g),
              carbsPer100g: numberText(source.carbsPer100g),
              fatPer100g: numberText(source.fatPer100g),
              fiberPer100g: numberText(source.fiberPer100g),
            },
          }
        : null;
    setForm(productForm.form);
    setNutritionMode(productForm.nutritionMode);
    setServing(productForm.serving);
    setMealCategories(source.mealCategories ?? []);
  }, [source, preferPer100g]);

  function updateField(key: keyof ProductFormState, value: string) {
    if (key === "caloriesPer100g" && nutritionMode === "perServing") {
      linkedChange("calories", value);
    } else {
      linkedStart.current = null;
      if (isNutrientKey(key)) baseline.current = null;
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    }

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  }

  function field(key: keyof ProductFormState) {
    return {
      value: form[key],
      onChangeText: (text: string) => updateField(key, text),
    };
  }

  function updateImage(uri: string) {
    updateField("imageUrl", uri);
  }

  function removeImage() {
    updateField("imageUrl", "");
  }

  function switchMode(mode: NutritionMode) {
    if (mode === nutritionMode) return;
    const grams = parseNumber(serving.grams);
    const milliliters = parseNumber(serving.milliliters);
    const baseUnit = (target: NutritionMode) => (target === "per100ml" ? "milliliters" : "grams");
    const baseAmount = (target: NutritionMode) => (target === "per100ml" ? milliliters : grams);
    let converted: ProductFormState | null = null;

    if (mode === "perServing") {
      const amount = baseAmount(nutritionMode);
      baseline.current = hasNutrients(form) ? { unit: baseUnit(nutritionMode), form } : null;
      if (amount) converted = scaleNutrition(form, amount / 100, false);
    } else if (nutritionMode === "perServing") {
      const amount = baseAmount(mode);
      if (baseline.current?.unit === baseUnit(mode)) {
        converted = baseline.current.form;
      } else if (amount) {
        converted = scaleNutrition(form, 100 / amount, false);
      }
    } else if (grams && milliliters) {
      converted = scaleNutrition(form, mode === "per100ml" ? grams / milliliters : milliliters / grams, false);
    }

    if (mode !== "perServing") baseline.current = null;
    linkedStart.current = null;
    setScaledBy(null);
    setNutritionMode(mode);
    setErrors({});
    setForm((prev) => ({ ...prev, ...(converted ? nutrientsOf(converted) : EMPTY_NUTRIENTS) }));
  }

  function updateServing(key: keyof ServingFormState, value: string) {
    if (key !== "unit" && nutritionMode === "perServing") {
      linkedChange(key, value);
    } else {
      linkedStart.current = null;
      setServing((prev) => ({ ...prev, [key]: value }));
    }

    if (errors.servingSizeG || errors.servingSizeMl || errors.servingQuantity) {
      setErrors((prev) => ({
        ...prev,
        servingSizeG: undefined,
        servingSizeMl: undefined,
        servingQuantity: undefined,
      }));
    }
  }

  function scaleText(value: string, ratio: number, kind: "calories" | "grams" | "amount") {
    const parsed = parseNumber(value);
    if (parsed === null) return value;
    const next = parsed * ratio;
    if (kind === "calories") return String(Math.round(next));
    if (kind === "grams") return String(Math.round(next * 10) / 10);
    return formatAmount(next);
  }

  function scaleNutrition(source: ProductFormState, ratio: number, keepCalories: boolean): ProductFormState {
    return {
      ...source,
      caloriesPer100g: keepCalories ? source.caloriesPer100g : scaleText(source.caloriesPer100g, ratio, "calories"),
      proteinPer100g: scaleText(source.proteinPer100g, ratio, "grams"),
      carbsPer100g: scaleText(source.carbsPer100g, ratio, "grams"),
      fatPer100g: scaleText(source.fatPer100g, ratio, "grams"),
      fiberPer100g: scaleText(source.fiberPer100g, ratio, "grams"),
    };
  }

  function linkedChange(changed: "calories" | "quantity" | "grams" | "milliliters", value: string) {
    if (!linkedStart.current) linkedStart.current = { form, serving };
    const start = linkedStart.current;

    const before =
      changed === "calories"
        ? parseNumber(start.form.caloriesPer100g)
        : parseNumber(start.serving[changed]);
    const after = parseNumber(value);
    if ((!before || !after) && after && applyBaseline(changed, value, after)) return;
    const ratio = before && after ? after / before : 1;

    setForm({
      ...scaleNutrition(start.form, ratio, false),
      name: form.name,
      brand: form.brand,
      imageUrl: form.imageUrl,
      ...(changed === "calories" ? { caloriesPer100g: value } : {}),
    });
    setServing({
      ...serving,
      quantity: changed === "quantity" ? value : scaleText(start.serving.quantity, ratio, "amount"),
      grams: changed === "grams" ? value : scaleText(start.serving.grams, ratio, "grams"),
      milliliters: changed === "milliliters" ? value : scaleText(start.serving.milliliters, ratio, "grams"),
    });
    setScaledBy(ratio !== 1 ? ratio : null);
  }

  function applyBaseline(changed: "calories" | "quantity" | "grams" | "milliliters", value: string, after: number) {
    const base = baseline.current;
    if (!base) return false;
    let amount: number | null = null;
    if (changed === "calories") {
      const caloriesPer100 = parseNumber(base.form.caloriesPer100g);
      amount = caloriesPer100 ? (after / caloriesPer100) * 100 : null;
    } else if (changed === base.unit) {
      amount = after;
    }
    if (amount == null) return false;

    setForm({
      ...form,
      ...nutrientsOf(scaleNutrition(base.form, amount / 100, false)),
      ...(changed === "calories" ? { caloriesPer100g: value } : {}),
    });
    setServing({
      ...serving,
      quantity: serving.quantity.trim() ? serving.quantity : "1",
      [base.unit]: changed === base.unit ? value : String(Math.round(amount * 10) / 10),
    });
    setScaledBy(null);
    return true;
  }

  function beginLinkedEdit() {
    linkedStart.current = { form, serving };
  }

  function endLinkedEdit() {
    linkedStart.current = null;
  }

  function applyServingReference(quantity: number, grams: number) {
    const oldGrams = parseNumber(serving.grams);
    if (nutritionMode === "perServing" && baseline.current?.unit === "grams") {
      setForm((prev) => ({ ...prev, ...nutrientsOf(scaleNutrition(baseline.current!.form, grams / 100, false)) }));
      setScaledBy(null);
    } else if (nutritionMode === "perServing" && oldGrams && oldGrams !== grams) {
      const ratio = grams / oldGrams;
      setForm((prev) => scaleNutrition(prev, ratio, false));
      setScaledBy(ratio);
    }
    setServing((prev) => ({ ...prev, quantity: formatAmount(quantity), grams: formatAmount(grams) }));
  }

  function toggleCategory(cat: ProductCategory) {
    setMealCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function validate() {
    const result = buildProductPayload({
      form,
      serving,
      nutritionMode,
      requireCoreValues,
      requiredFieldError,
      invalidNumberError,
    });

    if (result.errors) {
      setErrors(result.errors);
      return null;
    }

    return { ...withBaseline(result.payload), mealCategories };
  }

  function withBaseline<T extends ReturnType<typeof buildProductPayload>["payload"]>(payload: NonNullable<T>) {
    const base = baseline.current;
    const basis = base?.unit === "milliliters" ? "PER_100ML" : "PER_100G";
    if (!base || nutritionMode !== "perServing" || payload.nutritionBasis !== basis) return payload;
    const exact = (text: string, fallback: number | null) => {
      const parsed = parseFloat(text.replace(",", "."));
      return text.trim() && Number.isFinite(parsed) ? parsed : fallback;
    };
    return {
      ...payload,
      caloriesPer100g: exact(base.form.caloriesPer100g, payload.caloriesPer100g ?? null),
      proteinPer100g: exact(base.form.proteinPer100g, payload.proteinPer100g ?? null),
      carbsPer100g: exact(base.form.carbsPer100g, payload.carbsPer100g ?? null),
      fatPer100g: exact(base.form.fatPer100g, payload.fatPer100g ?? null),
      fiberPer100g: exact(base.form.fiberPer100g, null),
    };
  }

  return {
    form,
    errors,
    nutritionMode,
    serving,
    mealCategories,
    isPerServing: nutritionMode === "perServing",
    isPerVolume: nutritionMode === "per100ml",
    hasImagePreview: Boolean(form.imageUrl.trim()),

    field,
    updateImage,
    removeImage,
    switchMode,
    updateServing,
    beginLinkedEdit,
    endLinkedEdit,
    applyServingReference,
    scaledBy,
    toggleCategory,
    validate,
  };
}
