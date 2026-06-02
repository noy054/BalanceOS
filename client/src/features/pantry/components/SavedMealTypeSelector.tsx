import { ScrollView, Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { MEAL_TYPES } from "../constants";
import { MealType } from "../types";
import { styles } from "./styles/SavedMealForm.styles";

type Props = {
  selectedMealType: MealType | null;
  isRTL: boolean;
  onSelect: (mealType: MealType | null) => void;
};

export function SavedMealTypeSelector({
  selectedMealType,
  onSelect,
}: Props) {
  const { t } = useTranslation("pantry");

  // System RTL (I18nManager.forceRTL set in _layout.tsx) reverses "row" automatically.
  // No manual flexDirection override or array reversal needed.
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.mealTypeRow}
    >
      {MEAL_TYPES.map((type) => {
        const isActive = selectedMealType === type;

        return (
          <Pressable
            key={type}
            style={({ pressed }) => [
              styles.mealTypeChip,
              isActive && styles.mealTypeChipActive,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onSelect(isActive ? null : type)}
          >
            <Text
              style={[
                styles.mealTypeText,
                isActive && styles.mealTypeTextActive,
              ]}
            >
              {t(`mealTypes.${type}` as Parameters<typeof t>[0])}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
