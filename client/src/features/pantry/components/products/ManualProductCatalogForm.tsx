import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { FormInput } from "../../../../shared/components/FormInput";
import { isAxiosError } from "axios";
import { useCreatePantryProduct } from "../../hooks/usePantry";
import { PantryProduct } from "../../types";
import { useAppTheme } from "../../../../shared/theme";
import { useStyles } from "./styles/ManualProductCatalogForm.styles";

type Props = {
  barcode: string;
  onSuccess: (product: PantryProduct) => void;
  onCancel: () => void;
};

function parsePositive(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? undefined : n;
}

/**
 * Manual entry for a barcode no source knows. Saves to the user's own pantry only —
 * user-entered values never go into the shared global catalog.
 */
export function ManualProductCatalogForm({
  barcode,
  onSuccess,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const textAlign = isRTL ? "right" : "left";

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
        // validate() guarantees the four required macros parse
        caloriesPer100g: parsePositive(calories) ?? 0,
        proteinPer100g: parsePositive(protein) ?? 0,
        carbsPer100g: parsePositive(carbs) ?? 0,
        fatPer100g: parsePositive(fat) ?? 0,
        fiberPer100g: parsePositive(fiber),
        servingSizeG: servingSize != null && servingSize >= 1 ? servingSize : undefined,
      });
      onSuccess(product);
    } catch (err: unknown) {
      const alreadyExists = isAxiosError(err) && err.response?.status === 409;
      Alert.alert("", t(alreadyExists ? "barcode.alreadyInPantry" : "errors.saveFailed"));
    }
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="pencil-plus-outline"
            size={20}
            color={colors.primaryGreen}
          />
        </View>
        <Text style={[styles.headerTitle, { textAlign }]}>
          {t("barcode.manualForm.title")}
        </Text>
      </View>

      {barcode ? (
        <View
          style={[
            styles.barcodeChip,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <MaterialCommunityIcons
            name="barcode"
            size={14}
            color={colors.textMuted}
          />
          <Text style={styles.barcodeText}>{barcode}</Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.form}
      >
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

        <Text style={[styles.sectionLabel, { textAlign }]}>
          {t("barcode.manualForm.nutritionSection")}
        </Text>

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
        <FormInput
          label={t("barcode.manualForm.fiberLabel")}
          value={fiber}
          onChangeText={setFiber}
          keyboardType="decimal-pad"
        />
        <FormInput
          label={t("barcode.manualForm.servingSizeLabel")}
          value={servingSizeG}
          onChangeText={setServingSizeG}
          keyboardType="decimal-pad"
        />
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && styles.submitBtnPressed,
            createMutation.isPending && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Text style={styles.submitBtnText}>
            {createMutation.isPending
              ? t("barcode.manualForm.saving")
              : t("barcode.manualForm.saveButton")}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.cancelBtn,
            pressed && styles.cancelBtnPressed,
          ]}
          onPress={onCancel}
        >
          <Text style={styles.cancelBtnText}>
            {t("barcode.manualForm.cancel")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
