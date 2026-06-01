import { useState } from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useCreatePantryProduct } from "../hooks/usePantry";
import { CreatePantryProductPayload } from "../types";
import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormInput } from "../../../shared/components/FormInput";
import {
  getDirectionStyles,
  styles,
} from "./styles/AddProductScreen.styles";

type FormState = {
  name: string;
  brand: string;
  barcode: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
};

const INITIAL: FormState = {
  name: "",
  brand: "",
  barcode: "",
  caloriesPer100g: "",
  proteinPer100g: "",
  carbsPer100g: "",
  fatPer100g: "",
  fiberPer100g: "",
};

function parseNum(value: string): number | undefined {
  const parsedNumber = parseFloat(value.replace(",", "."));

  return isNaN(parsedNumber) || parsedNumber < 0 ? undefined : parsedNumber;
}

export function AddProductScreen() {
  const { t, i18n } = useTranslation("pantry");

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const directionStyles = getDirectionStyles(isRTL);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const createProduct = useCreatePantryProduct();

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
    const newErrors: typeof errors = {};

    if (!form.name.trim()) {
      newErrors.name = t("errors.requiredField");
    }

    const calories = parseNum(form.caloriesPer100g);
    if (calories === undefined) {
      newErrors.caloriesPer100g = t("errors.invalidNumber");
    }

    const protein = parseNum(form.proteinPer100g);
    if (protein === undefined) {
      newErrors.proteinPer100g = t("errors.invalidNumber");
    }

    const carbs = parseNum(form.carbsPer100g);
    if (carbs === undefined) {
      newErrors.carbsPer100g = t("errors.invalidNumber");
    }

    const fat = parseNum(form.fatPer100g);
    if (fat === undefined) {
      newErrors.fatPer100g = t("errors.invalidNumber");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }

    const fiber = form.fiberPer100g.trim()
      ? parseNum(form.fiberPer100g)
      : undefined;

    return {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      caloriesPer100g: calories!,
      proteinPer100g: protein!,
      carbsPer100g: carbs!,
      fatPer100g: fat!,
      fiberPer100g: fiber,
    };
  }

  async function handleSave() {
    const payload = validate();

    if (!payload) return;

    try {
      await createProduct.mutateAsync(payload);
      router.back();
    } catch {
      Alert.alert("", t("errors.saveFailed"));
    }
  }

  return (
    <SafeAreaView
      key={i18n.language}
      style={styles.root}
      edges={["top"]}
    >
      <ScreenHeader title={t("addProduct.title")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, directionStyles.text]}>
          {t("addProduct.subtitle")}
        </Text>

        <Text style={[styles.requiredHint, directionStyles.text]}>
          {t("addProduct.requiredHint")}
        </Text>

        <FormInput
          key={`name-${i18n.language}`}
          label={t("product.nameLabel")}
          error={errors.name}
          autoFocus
          {...field("name")}
        />

        <FormInput
          key={`brand-${i18n.language}`}
          label={t("product.brandLabel")}
          error={errors.brand}
          {...field("brand")}
        />

        <FormInput
          key={`barcode-${i18n.language}`}
          label={t("product.barcodeLabel")}
          error={errors.barcode}
          keyboardType="number-pad"
          {...field("barcode")}
        />

        <Text style={[styles.sectionTitle, directionStyles.text]}>
          {t("addProduct.nutritionSection")}
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

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
          ]}
          onPress={handleSave}
          disabled={createProduct.isPending}
        >
          <Text style={[styles.saveBtnText, directionStyles.centeredText]}>
            {createProduct.isPending
              ? t("addProduct.saving")
              : t("addProduct.saveButton")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
