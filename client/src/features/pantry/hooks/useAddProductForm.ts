import { useEffect, useState } from "react";

import { PantryProduct, ProductCategory } from "../types";
import {
  buildProductPayload,
  getProductFormFromProduct,
  INITIAL_PRODUCT_FORM,
  NutritionMode,
  ProductFormErrors,
  ProductFormState,
} from "../helpers/productForm";

type Args = {
  productToEdit?: PantryProduct;
  isEditMode: boolean;
  requiredFieldError: string;
  invalidNumberError: string;
};

export function useAddProductForm({
  productToEdit,
  isEditMode,
  requiredFieldError,
  invalidNumberError,
}: Args) {
  const [form, setForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [nutritionMode, setNutritionMode] = useState<NutritionMode>("per100g");
  const [servingSizeG, setServingSizeG] = useState("");
  const [mealCategories, setMealCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    if (!isEditMode || !productToEdit) {
      return;
    }

    const productForm = getProductFormFromProduct(productToEdit);

    setForm(productForm.form);
    setNutritionMode(productForm.nutritionMode);
    setServingSizeG(productForm.servingSizeG);
    setMealCategories(productToEdit.mealCategories ?? []);
  }, [isEditMode, productToEdit]);

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
    setServingSizeG("");
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

  function updateServingSize(value: string) {
    setServingSizeG(value);

    if (errors.servingSizeG) {
      setErrors((prev) => ({
        ...prev,
        servingSizeG: undefined,
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
      servingSizeG,
      nutritionMode,
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
    servingSizeG,
    mealCategories,
    isPerServing: nutritionMode === "perServing",
    hasImagePreview: Boolean(form.imageUrl.trim()),

    field,
    updateImage,
    removeImage,
    switchMode,
    updateServingSize,
    toggleCategory,
    validate,
  };
}
