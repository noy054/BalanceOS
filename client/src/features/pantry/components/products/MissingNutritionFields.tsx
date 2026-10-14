import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { FormInput } from "../../../../shared/components/FormInput";
import { useAppTheme } from "../../../../shared/theme";
import { RequiredMacroKey } from "../../helpers/catalogNutrition";
import { useStyles } from "./styles/MissingNutritionFields.styles";

const LABEL_KEYS: Record<RequiredMacroKey, string> = {
  caloriesPer100g: "barcode.manualForm.caloriesLabel",
  proteinPer100g: "barcode.manualForm.proteinLabel",
  carbsPer100g: "barcode.manualForm.carbsLabel",
  fatPer100g: "barcode.manualForm.fatLabel",
};

type Props = {
  missingKeys: RequiredMacroKey[];
  values: Partial<Record<RequiredMacroKey, string>>;
  errors: Partial<Record<RequiredMacroKey, string>>;
  onChange: (key: RequiredMacroKey, value: string) => void;
};

/** Asks for per-100g values the catalog source did not provide, instead of silently using 0. */
export function MissingNutritionFields({ missingKeys, values, errors, onChange }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const textAlign = isRTL ? "right" : "left";

  if (missingKeys.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { textAlign }]}>{t("barcode.missingNutrition.title")}</Text>
          <Text style={[styles.hint, { textAlign }]}>{t("barcode.missingNutrition.hint")}</Text>
        </View>
      </View>

      {missingKeys.map((key) => (
        <FormInput
          key={key}
          label={t(LABEL_KEYS[key])}
          value={values[key] ?? ""}
          onChangeText={(v) => onChange(key, v)}
          error={errors[key]}
          keyboardType="decimal-pad"
        />
      ))}
    </View>
  );
}
