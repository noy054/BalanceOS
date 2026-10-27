import { useState } from "react";
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { Button } from "../../../../shared/components/ui/Button";
import { useCreatePantryProduct } from "../../hooks/usePantry";
import { PantryProduct } from "../../types";
import { getProductSaveErrorKey } from "../../helpers/barcode";
import { useAppTheme } from "../../../../shared/theme";
import { useStyles } from "./styles/BarcodeManualProductForm.styles";

type Props = {
  barcode: string;
  onSuccess: (product: PantryProduct) => void;
  onCancel: () => void;
};

function parsePositive(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? undefined : n;
}

export function BarcodeManualProductForm({
  barcode,
  onSuccess,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const textAlign = isRTL ? "right" : "left";
  const rowDirection = isRTL ? "row-reverse" : "row";

  const createMutation = useCreatePantryProduct();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [servingSizeG, setServingSizeG] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("errors.requiredField");
    if (!calories || parsePositive(calories) === undefined)
      errs.calories = t("errors.invalidNumber");
    if (!protein || parsePositive(protein) === undefined)
      errs.protein = t("errors.invalidNumber");
    if (!carbs || parsePositive(carbs) === undefined)
      errs.carbs = t("errors.invalidNumber");
    if (!fat || parsePositive(fat) === undefined)
      errs.fat = t("errors.invalidNumber");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || createMutation.isPending) return;
    try {
      const servingSize = parsePositive(servingSizeG);
      const product = await createMutation.mutateAsync({
        barcode: barcode || undefined,
        name: name.trim(),
        brand: brand.trim() || undefined,
        caloriesPer100g: parsePositive(calories) ?? 0,
        proteinPer100g: parsePositive(protein) ?? 0,
        carbsPer100g: parsePositive(carbs) ?? 0,
        fatPer100g: parsePositive(fat) ?? 0,
        fiberPer100g: parsePositive(fiber),
        servingSizeG: servingSize != null && servingSize >= 1 ? servingSize : undefined,
      });
      onSuccess(product);
    } catch (err: unknown) {
      Alert.alert("", t(getProductSaveErrorKey(err)));
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.form}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { textAlign }]}>
            {t("barcode.manualForm.title")}
          </Text>

          {barcode ? (
            <View
              style={[
                styles.barcodeChip,
                { flexDirection: rowDirection, alignSelf: isRTL ? "flex-end" : "flex-start" },
              ]}
            >
              <MaterialCommunityIcons name="barcode" size={16} color={colors.textMuted} />
              <Text style={styles.barcodeText}>{barcode}</Text>
            </View>
          ) : null}
        </View>

        <FormSection title={t("addProduct.detailsSection")}>
          <FormInput
            label={t("barcode.manualForm.nameLabel")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setErrors((e) => ({ ...e, name: "" }));
            }}
            error={errors.name}
            autoFocus
          />
          <FormInput
            label={t("barcode.manualForm.brandLabel")}
            value={brand}
            onChangeText={setBrand}
          />
        </FormSection>

        <FormSection title={t("barcode.manualForm.nutritionSection")}>
          <FormInput
            label={t("barcode.manualForm.caloriesLabel")}
            value={calories}
            onChangeText={(v) => {
              setCalories(v);
              setErrors((e) => ({ ...e, calories: "" }));
            }}
            error={errors.calories}
            keyboardType="decimal-pad"
          />

          <View style={[styles.grid, { flexDirection: rowDirection }]}>
            <View style={styles.gridCell}>
              <FormInput
                label={t("barcode.manualForm.proteinLabel")}
                value={protein}
                onChangeText={(v) => {
                  setProtein(v);
                  setErrors((e) => ({ ...e, protein: "" }));
                }}
                error={errors.protein}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.gridCell}>
              <FormInput
                label={t("barcode.manualForm.carbsLabel")}
                value={carbs}
                onChangeText={(v) => {
                  setCarbs(v);
                  setErrors((e) => ({ ...e, carbs: "" }));
                }}
                error={errors.carbs}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={[styles.grid, { flexDirection: rowDirection }]}>
            <View style={styles.gridCell}>
              <FormInput
                label={t("barcode.manualForm.fatLabel")}
                value={fat}
                onChangeText={(v) => {
                  setFat(v);
                  setErrors((e) => ({ ...e, fat: "" }));
                }}
                error={errors.fat}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.gridCell}>
              <FormInput
                label={t("barcode.manualForm.fiberLabel")}
                value={fiber}
                onChangeText={setFiber}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <FormInput
            label={t("barcode.manualForm.servingSizeLabel")}
            value={servingSizeG}
            onChangeText={setServingSizeG}
            keyboardType="decimal-pad"
          />
        </FormSection>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label={
            createMutation.isPending
              ? t("barcode.manualForm.saving")
              : t("barcode.manualForm.saveButton")
          }
          onPress={handleSubmit}
          loading={createMutation.isPending}
          fullWidth
        />

        <Button
          label={t("barcode.manualForm.cancel")}
          variant="ghost"
          onPress={onCancel}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
  );
}
