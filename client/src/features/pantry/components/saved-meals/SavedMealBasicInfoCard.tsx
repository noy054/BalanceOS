import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MealType } from "../../types";
import { SavedMealTypeSelector } from "./SavedMealTypeSelector";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/SavedMealBasicInfoCard.styles";

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
    <View style={styles.formCard}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, dir.text]}>
          {t("savedMeal.nameLabel")}
        </Text>

        <TextInput
          style={[styles.input, nameError ? styles.inputError : null, dir.text]}
          value={name}
          onChangeText={onChangeName}
          placeholder={t("savedMeal.namePlaceholder", {
            defaultValue: "שם הארוחה",
          })}
          placeholderTextColor={styles.placeholder.color}
          autoFocus={false}
          returnKeyType="done"
        />

        {nameError ? (
          <Text style={[styles.errorText, dir.text]}>{nameError}</Text>
        ) : null}
      </View>

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
    </View>
  );
}
