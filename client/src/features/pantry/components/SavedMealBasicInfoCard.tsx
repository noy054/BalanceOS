import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MealType } from "../types";
import { SavedMealTypeSelector } from "./SavedMealTypeSelector";
import { styles } from "./styles/SavedMealForm.styles";

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

  const textDirection = {
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
  };

  return (
    <View style={styles.formCard}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, textDirection]}>
          {t("savedMeal.nameLabel")}
        </Text>

        <TextInput
          style={[
            styles.input,
            nameError ? styles.inputError : null,
            textDirection,
          ]}
          value={name}
          onChangeText={onChangeName}
          autoFocus
        />

        {nameError ? (
          <Text style={[styles.errorText, textDirection]}>{nameError}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, textDirection]}>
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
