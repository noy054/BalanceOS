import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import {
  useCreatePantryProduct,
  usePantryProduct,
  useUpdatePantryProduct,
} from "../hooks/usePantry";
import { useRecipeReturn } from "../recipeReturnStore";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { useAppTheme } from "../../../shared/theme";
import { ProductBasicInfoForm } from "../components/products/ProductBasicInfoForm";
import { ProductCategoryPicker } from "../components/products/ProductCategoryPicker";
import { ProductImagePicker } from "../components/products/ProductImagePicker";
import { ProductNutritionForm } from "../components/products/ProductNutritionForm";
import { useAddProductForm } from "../hooks/useAddProductForm";
import { useProductImagePicker } from "../hooks/useProductImagePicker";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/AddProductScreen.styles";

export function AddProductScreen() {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
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
    permissionDeniedMessage: t("errors.galleryPermissionDenied", {
      defaultValue: "צריך לאשר גישה לגלריה כדי לבחור תמונה",
    }),
  });

  useEffect(() => {
    if (!fromRecipePicker) {
      return;
    }

    return navigation.addListener("beforeRemove", () => {
      if (isSavingRef.current) {
        isSavingRef.current = false;
        return;
      }

      setReopenPicker(true);
    });
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

        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={28}
            color={colors.primaryGreen}
          />

          <Text style={[styles.loadingText, directionStyles.text]}>
            {t("addProduct.loadingProduct")}
          </Text>
        </View>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={[styles.subtitle, directionStyles.text]}>
            {isEditMode
              ? t("addProduct.editSubtitle")
              : t("addProduct.subtitle")}
          </Text>

          <Text style={[styles.optionalHint, directionStyles.text]}>
            {t("addProduct.optionalNutritionHint")}
          </Text>
        </View>

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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View
        style={[
          styles.stickyFooter,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            isSaving && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={[styles.saveBtnText, directionStyles.centeredText]}>
            {isSaving
              ? t("addProduct.saving")
              : isEditMode
                ? t("addProduct.updateButton")
                : t("addProduct.saveButton")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
