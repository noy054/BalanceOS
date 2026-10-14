import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

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
    <View style={styles.formCard}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("recipe.nameLabel")}
        </Text>

        <TextInput
          style={[styles.input, nameError ? styles.inputError : null, dir.text]}
          value={name}
          onChangeText={onChangeName}
          autoFocus
        />

        {nameError ? (
          <Text style={[styles.errorText, dir.text]}>{nameError}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("recipe.descriptionLabel")}
        </Text>

        <TextInput
          style={[styles.input, styles.descriptionInput, dir.text]}
          value={description}
          onChangeText={onChangeDescription}
          multiline
        />
      </View>

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
    </View>
  );
}
