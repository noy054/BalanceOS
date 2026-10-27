import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import {
  useCreatePantryProduct,
  usePantryProduct,
  useUpdatePantryProduct,
} from "../hooks/usePantry";
import { useRecipeReturn } from "../recipeReturnStore";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StateView } from "../../../shared/components/ui/StateView";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { ProductBasicInfoForm } from "../components/products/ProductBasicInfoForm";
import { ProductCategoryPicker } from "../components/products/ProductCategoryPicker";
import { ProductImagePicker } from "../components/products/ProductImagePicker";
import { ProductNutritionForm } from "../components/products/ProductNutritionForm";
import { useAddProductForm } from "../hooks/useAddProductForm";
import { useProductImagePicker } from "../hooks/useProductImagePicker";
import { getDirectionStyles, useStyles } from "./styles/FormScreen.styles";

export function AddProductScreen() {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();
  const navigation = useNavigation();

  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
    returnTo?: string;
  }>();

  const productId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(productId);
  const fromRecipePicker = params.returnTo === "recipe";

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const directionStyles = getDirectionStyles(isRTL);

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const isSavingRef = useRef(false);

  const createProduct = useCreatePantryProduct();
  const updateProduct = useUpdatePantryProduct(productId);
  const setPending = useRecipeReturn((state) => state.setPending);
  const setReopenPicker = useRecipeReturn((state) => state.setReopenPicker);

  const { data: productToEdit, isLoading: isProductLoading } =
    usePantryProduct(productId);

  const form = useAddProductForm({
    productToEdit,
    isEditMode,
    requiredFieldError: t("errors.requiredField"),
    invalidNumberError: t("errors.invalidNumber"),
  });

  const imagePicker = useProductImagePicker({
    onPick: form.updateImage,
    permissionDeniedMessage: t("errors.galleryPermissionDenied"),
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

  async function handleSave() {
    const payload = form.validate();

    if (!payload) {
      return;
    }

    setIsSavingLocal(true);
    isSavingRef.current = true;

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync({
          ...payload,
          ...(form.nutritionMode === "per100g" && { servingSizeG: null }),
        });
      } else {
        const created = await createProduct.mutateAsync(payload);

        if (fromRecipePicker) {
          setPending(created);
        }
      }

      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace("/(app)/pantry");
    } catch {
      isSavingRef.current = false;
      Alert.alert("", t("errors.saveFailed"));
    } finally {
      setIsSavingLocal(false);
    }
  }

  const isSaving =
    isSavingLocal || createProduct.isPending || updateProduct.isPending;

  if (isEditMode && isProductLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader
          title={t("addProduct.editTitle")}
          fallbackRoute="/(app)/pantry"
        />

        <StateView variant="loading" message={t("addProduct.loadingProduct")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView key={i18n.language} style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={isEditMode ? t("addProduct.editTitle") : t("addProduct.title")}
        fallbackRoute="/(app)/pantry"
        onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.intro, directionStyles.text]}>
            {isEditMode
              ? t("addProduct.editSubtitle")
              : t("addProduct.subtitle")}
          </Text>

          <ProductImagePicker
            imageUrl={form.form.imageUrl}
            hasImagePreview={form.hasImagePreview}
            isRTL={isRTL}
            t={t}
            onPickImage={imagePicker.pickImage}
            onRemoveImage={form.removeImage}
          />

          <ProductBasicInfoForm
            t={t}
            language={i18n.language}
            errors={form.errors}
            autoFocus={!isEditMode && !fromRecipePicker}
            field={form.field}
          />

          <ProductCategoryPicker
            t={t}
            isRTL={isRTL}
            selectedCategories={form.mealCategories}
            onToggle={form.toggleCategory}
          />

          <ProductNutritionForm
            t={t}
            language={i18n.language}
            isRTL={isRTL}
            errors={form.errors}
            nutritionMode={form.nutritionMode}
            isPerServing={form.isPerServing}
            servingSizeG={form.servingSizeG}
            onSwitchMode={form.switchMode}
            onChangeServingSize={form.updateServingSize}
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
                  : t("addProduct.saveButton")
            }
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
