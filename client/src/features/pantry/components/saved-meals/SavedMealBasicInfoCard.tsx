import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { MealType } from "../../types";
import { SavedMealTypeSelector } from "./SavedMealTypeSelector";
import {
  getDirectionStyles,
  useStyles,
} from "../recipes/styles/RecipeBasicInfoCard.styles";

type Props = {
  name: string;
  nameError: string;
  mealType: MealType | null;
  isRTL: boolean;
  onChangeName: (value: string) => void;
  onChangeMealType: (value: MealType | null) => void;
};

export function SavedMealBasicInfoCard({
  name,
  nameError,
  mealType,
  isRTL,
  onChangeName,
  onChangeMealType,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <FormSection title={t("addProduct.detailsSection")}>
      <FormInput
        label={t("savedMeal.nameLabel")}
        value={name}
        onChangeText={onChangeName}
        error={nameError || undefined}
        placeholder={t("savedMeal.namePlaceholder")}
        returnKeyType="done"
      />

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("savedMeal.mealTypeLabel")}
        </Text>

        <SavedMealTypeSelector
          selectedMealType={mealType}
          isRTL={isRTL}
          onSelect={onChangeMealType}
        />
      </View>
    </FormSection>
  );
}
