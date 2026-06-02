import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import {
  useCreatePantryProduct,
  usePantryProduct,
  useUpdatePantryProduct,
} from "../hooks/usePantry";
import { CreatePantryProductPayload } from "../types";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormInput } from "../../../shared/components/FormInput";
import { colors } from "../../../shared/theme";
import { getDirectionStyles, styles } from "./styles/AddProductScreen.styles";

type FormState = {
  name: string;
  brand: string;
  imageUrl: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
};

const INITIAL: FormState = {
  name: "",
  brand: "",
  imageUrl: "",
  caloriesPer100g: "",
  proteinPer100g: "",
  carbsPer100g: "",
  fatPer100g: "",
  fiberPer100g: "",
};

function parseOptionalNumber(value: string): number | null {
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

function toFormString(value?: number | null) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

export function AddProductScreen() {
  const { t, i18n } = useTranslation("pantry");
  const params = useLocalSearchParams<{ id?: string; mode?: string }>();
  const insets = useSafeAreaInsets();

  const productId = typeof params.id === "string" ? params.id : "";
  const isEditMode = params.mode === "edit" && Boolean(productId);

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const directionStyles = getDirectionStyles(isRTL);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const createProduct = useCreatePantryProduct();
  const updateProduct = useUpdatePantryProduct(productId);

  const { data: productToEdit, isLoading: isProductLoading } =
    usePantryProduct(productId);

  useEffect(() => {
    if (!isEditMode || !productToEdit) {
      return;
    }

    setForm({
      name: productToEdit.name ?? "",
      brand: productToEdit.brand ?? "",
      imageUrl: productToEdit.imageUrl ?? "",
      caloriesPer100g: toFormString(productToEdit.caloriesPer100g),
      proteinPer100g: toFormString(productToEdit.proteinPer100g),
      carbsPer100g: toFormString(productToEdit.carbsPer100g),
      fatPer100g: toFormString(productToEdit.fatPer100g),
      fiberPer100g: toFormString(productToEdit.fiberPer100g),
    });
  }, [isEditMode, productToEdit]);

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChangeText: (text: string) => {
        setForm((prev) => ({
          ...prev,
          [key]: text,
        }));

        if (errors[key]) {
          setErrors((prev) => ({
            ...prev,
            [key]: undefined,
          }));
        }
      },
    };
  }

  function validate(): CreatePantryProductPayload | null {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = t("errors.requiredField");
    }

    const calories = parseOptionalNumber(form.caloriesPer100g);
    const protein = parseOptionalNumber(form.proteinPer100g);
    const carbs = parseOptionalNumber(form.carbsPer100g);
    const fat = parseOptionalNumber(form.fatPer100g);
    const fiber = parseOptionalNumber(form.fiberPer100g);

    if (calories === null) {
      newErrors.caloriesPer100g = t("errors.invalidNumber");
    }

    if (protein === null) {
      newErrors.proteinPer100g = t("errors.invalidNumber");
    }

    if (carbs === null) {
      newErrors.carbsPer100g = t("errors.invalidNumber");
    }

    if (fat === null) {
      newErrors.fatPer100g = t("errors.invalidNumber");
    }

    if (fiber === null) {
      newErrors.fiberPer100g = t("errors.invalidNumber");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }

    return {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      caloriesPer100g: calories ?? 0,
      proteinPer100g: protein ?? 0,
      carbsPer100g: carbs ?? 0,
      fatPer100g: fat ?? 0,
      fiberPer100g: fiber ?? 0,
    };
  }

  async function handleSave() {
    const payload = validate();

    if (!payload) {
      return;
    }

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync(payload);
      } else {
        await createProduct.mutateAsync(payload);
      }

      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace("/(app)/pantry");
    } catch {
      Alert.alert("", t("errors.saveFailed"));
    }
  }

  const hasImagePreview = Boolean(form.imageUrl.trim());
  const isSaving = createProduct.isPending || updateProduct.isPending;

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

        <View style={styles.imageSection}>
          {hasImagePreview ? (
            <Image
              source={{ uri: form.imageUrl.trim() }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="image-plus-outline"
                size={28}
                color={colors.primaryGreen}
              />

              <Text style={styles.imagePlaceholderText}>
                {t("product.imagePlaceholder")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <FormInput
            key={`name-${i18n.language}`}
            label={t("product.nameLabel")}
            error={errors.name}
            autoFocus={!isEditMode}
            {...field("name")}
          />

          <FormInput
            key={`brand-${i18n.language}`}
            label={t("product.brandLabel")}
            error={errors.brand}
            {...field("brand")}
          />

          <FormInput
            key={`image-${i18n.language}`}
            label={t("product.imageUrlLabel")}
            error={errors.imageUrl}
            {...field("imageUrl")}
          />
        </View>

        <View style={styles.formCard}>
          <View style={[styles.sectionHeaderRow, directionStyles.row]}>
            <Text style={[styles.sectionTitle, directionStyles.text]}>
              {t("addProduct.nutritionSection")}
            </Text>

            <Text style={styles.sectionChip}>{t("addProduct.per100g")}</Text>
          </View>

          <Text style={[styles.sectionHint, directionStyles.text]}>
            {t("addProduct.emptyValuesBecomeZero")}
          </Text>

          <FormInput
            key={`calories-${i18n.language}`}
            label={t("product.caloriesLabel")}
            error={errors.caloriesPer100g}
            keyboardType="decimal-pad"
            {...field("caloriesPer100g")}
          />

          <FormInput
            key={`protein-${i18n.language}`}
            label={t("product.proteinLabel")}
            error={errors.proteinPer100g}
            keyboardType="decimal-pad"
            {...field("proteinPer100g")}
          />

          <FormInput
            key={`carbs-${i18n.language}`}
            label={t("product.carbsLabel")}
            error={errors.carbsPer100g}
            keyboardType="decimal-pad"
            {...field("carbsPer100g")}
          />

          <FormInput
            key={`fat-${i18n.language}`}
            label={t("product.fatLabel")}
            error={errors.fatPer100g}
            keyboardType="decimal-pad"
            {...field("fatPer100g")}
          />

          <FormInput
            key={`fiber-${i18n.language}`}
            label={t("product.fiberLabel")}
            error={errors.fiberPer100g}
            keyboardType="decimal-pad"
            {...field("fiberPer100g")}
          />
        </View>

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
