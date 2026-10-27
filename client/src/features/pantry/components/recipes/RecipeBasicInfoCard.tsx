import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SavedMealTypeSelector } from "../saved-meals/SavedMealTypeSelector";
import { MealType } from "../../types";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/RecipeBasicInfoCard.styles";

type Props = {
  name: string;
  description: string;
  mealType: MealType | null;
  nameError: string;
  isRTL: boolean;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeMealType: (value: MealType | null) => void;
};

export function RecipeBasicInfoCard({
  name,
  description,
  mealType,
  nameError,
  isRTL,
  onChangeName,
  onChangeDescription,
  onChangeMealType,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <FormSection title={t("addProduct.detailsSection")}>
      <FormInput
        label={t("recipe.nameLabel")}
        value={name}
        onChangeText={onChangeName}
        error={nameError || undefined}
        autoFocus
      />

      <FormInput
        label={t("recipe.descriptionLabel")}
        value={description}
        onChangeText={onChangeDescription}
        multiline
      />

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("recipe.categoryLabel")}
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
