import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (!source || hydratedIdRef.current === source.id) {
      return;
    }

    hydratedIdRef.current = source.id;
    const productForm = getProductFormFromProduct(source, { preferPer100g });

    setForm(productForm.form);
    setNutritionMode(productForm.nutritionMode);
    setServing(productForm.serving);
    setMealCategories(source.mealCategories ?? []);
  }, [source, preferPer100g]);

  function updateField(key: keyof ProductFormState, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

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
    setNutritionMode(mode);
    setErrors({});

    setForm((prev) => ({
      ...prev,
      caloriesPer100g: "",
      proteinPer100g: "",
      carbsPer100g: "",
      fatPer100g: "",
      fiberPer100g: "",
    }));
  }

  function updateServing(key: keyof ServingFormState, value: string) {
    setServing((prev) => ({ ...prev, [key]: value }));

    if (errors.servingSizeG || errors.servingQuantity) {
      setErrors((prev) => ({
        ...prev,
        servingSizeG: undefined,
        servingQuantity: undefined,
      }));
    }
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

    return { ...result.payload, mealCategories };
  }

  return {
    form,
    errors,
    nutritionMode,
    serving,
    mealCategories,
    isPerServing: nutritionMode === "perServing",
    hasImagePreview: Boolean(form.imageUrl.trim()),

    field,
    updateImage,
    removeImage,
    switchMode,
    updateServing,
    toggleCategory,
    validate,
  };
}
