import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import {
  useAddPantryProductFromCatalog,
  useCatalogItem,
  useCreatePantryProduct,
  usePantryProduct,
  useUpdatePantryProduct,
} from "../hooks/usePantry";
import { useRecipeReturn } from "../recipeReturnStore";
import { useMealReturn } from "../mealReturnStore";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { useAppTheme } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { ProductBasicInfoForm } from "../components/products/ProductBasicInfoForm";
import { ProductCategoryPicker } from "../components/products/ProductCategoryPicker";
import { ProductImagePicker } from "../components/products/ProductImagePicker";
import { ProductNutritionForm } from "../components/products/ProductNutritionForm";
import { ProductFormPrefill, useAddProductForm } from "../hooks/useAddProductForm";
import { getProductSaveErrorKey } from "../helpers/barcode";
import { PantryProduct } from "../types";
import { useStyles } from "./styles/FormScreen.styles";

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function AddProductScreen() {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const navigation = useNavigation();

  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
    returnTo?: string;
    barcode?: string;
    catalogId?: string;
  }>();

  const productId = param(params.id);
  const catalogId = param(params.catalogId);
  const barcode = param(params.barcode);
  const isEditMode = params.mode === "edit" && Boolean(productId);
  const isCatalogMode = !isEditMode && Boolean(catalogId);
  const fromRecipePicker = params.returnTo === "recipe";
  const fromMealFlow = params.returnTo === "meal";

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const isSavingRef = useRef(false);

  const createProduct = useCreatePantryProduct();
  const updateProduct = useUpdatePantryProduct(productId);
  const addFromCatalog = useAddPantryProductFromCatalog();
  const setRecipePending = useRecipeReturn((state) => state.setPending);
  const setReopenPicker = useRecipeReturn((state) => state.setReopenPicker);
  const setMealPending = useMealReturn((state) => state.setPending);

  const { data: productToEdit, isLoading: isProductLoading } = usePantryProduct(
    isEditMode ? productId : "",
  );
  const { data: catalogItem, isLoading: isCatalogLoading, isError: isCatalogError } =
    useCatalogItem(isCatalogMode ? catalogId : "");

  const source = useMemo<ProductFormPrefill | null>(() => {
    if (isEditMode) return productToEdit ?? null;
    if (isCatalogMode && catalogItem) {
      return {
        ...catalogItem,
        id: `catalog:${catalogItem.id}`,
        servingSizeG: catalogItem.servingSizeGrams,
        mealCategories: [],
      };
    }
    return null;
  }, [isEditMode, isCatalogMode, productToEdit, catalogItem]);

  const form = useAddProductForm({
    source,
    requireCoreValues: isCatalogMode,
    preferPer100g: isCatalogMode,
    requiredFieldError: t("errors.requiredField"),
    invalidNumberError: t("errors.invalidNumber"),
  });

  useEffect(() => {
    if (!fromRecipePicker) {
      return;
    }

    const unsubscribe = navigation.addListener("removed", () => {
      if (isSavingRef.current) {
        isSavingRef.current = false;
        return;
      }

      setReopenPicker(true);
    });

    return () => queueMicrotask(unsubscribe);
  }, [navigation, fromRecipePicker, setReopenPicker]);

  function handleBackFromRecipe() {
    setReopenPicker(true);
    router.back();
  }

  function finish(saved: PantryProduct | null) {
    if (saved && fromRecipePicker) setRecipePending(saved);
    if (saved && fromMealFlow) setMealPending(saved);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(app)/pantry");
  }

  async function handleSave() {
    const payload = form.validate();

    if (!payload) {
      return;
    }

    setIsSavingLocal(true);
    isSavingRef.current = true;

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync(payload);
        finish(null);
        return;
      }

      if (isCatalogMode) {
        const added = await addFromCatalog.mutateAsync({ catalogItemId: catalogId, payload });
        finish(added);
        return;
      }

      const created = await createProduct.mutateAsync({
        ...payload,
        brand: payload.brand ?? undefined,
        imageUrl: payload.imageUrl ?? undefined,
        barcode: barcode || undefined,
      });
      finish(created);
    } catch (err: unknown) {
      isSavingRef.current = false;
      Alert.alert("", t(getProductSaveErrorKey(err)));
    } finally {
      setIsSavingLocal(false);
    }
  }

  const isSaving =
    isSavingLocal || createProduct.isPending || updateProduct.isPending || addFromCatalog.isPending;

  const title = isEditMode
    ? t("addProduct.editTitle")
    : isCatalogMode
      ? t("addProduct.reviewTitle")
      : t("addProduct.title");

  if ((isEditMode && isProductLoading) || (isCatalogMode && isCatalogLoading)) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={title} fallbackRoute="/(app)/pantry" />
        <StateView variant="loading" message={t("addProduct.loadingProduct")} />
      </SafeAreaView>
    );
  }

  if (isCatalogMode && (isCatalogError || !catalogItem)) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={title} fallbackRoute="/(app)/pantry" />
        <StateView variant="error" message={t("errors.loadFailed")} />
      </SafeAreaView>
    );
  }

  const shownBarcode = isCatalogMode ? catalogItem?.barcode : barcode;

  return (
    <SafeAreaView key={i18n.language} style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={title}
        fallbackRoute="/(app)/pantry"
        onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
      />

      <KeyboardAvoider>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.intro, dir.text]}>
            {isEditMode
              ? t("addProduct.editSubtitle")
              : isCatalogMode
                ? t("addProduct.reviewSubtitle")
                : t("addProduct.subtitle")}
          </Text>

          {shownBarcode ? (
            <View style={[styles.barcodeChip, dir.row, dir.alignStart]}>
              <MaterialCommunityIcons name="barcode" size={16} color={colors.textSecondary} />
              <Text style={styles.barcodeText}>{shownBarcode}</Text>
            </View>
          ) : null}

          <ProductImagePicker
            imageUrl={form.form.imageUrl}
            onChangeImage={form.updateImage}
            onRemoveImage={form.removeImage}
          />

          <ProductBasicInfoForm
            t={t}
            language={i18n.language}
            errors={form.errors}
            autoFocus={!isEditMode && !isCatalogMode && !fromRecipePicker}
            field={form.field}
          />

          <ProductCategoryPicker
            t={t}
            isRTL={dir.isRTL}
            selectedCategories={form.mealCategories}
            onToggle={form.toggleCategory}
          />

          <ProductNutritionForm
            t={t}
            language={i18n.language}
            isRTL={dir.isRTL}
            errors={form.errors}
            nutritionMode={form.nutritionMode}
            isPerServing={form.isPerServing}
            serving={form.serving}
            requireCoreValues={isCatalogMode}
            onSwitchMode={form.switchMode}
            onChangeServing={form.updateServing}
            field={form.field}
          />
        </ScrollView>

        <StickyFooter>
          <Button
            label={
              isSaving
                ? t("addProduct.saving")
                : isEditMode
                  ? t("addProduct.updateButton")
                  : isCatalogMode
                    ? t("barcode.addToPantry")
                    : t("addProduct.saveButton")
            }
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoider>
    </SafeAreaView>
  );
}
