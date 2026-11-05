import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MEAL_TYPES } from "../../constants";
import { MealType } from "../../types";
import { ChoiceBoxes } from "./ChoiceBoxes";
import { getDirectionStyles, useStyles } from "../recipes/styles/RecipeBasicInfoCard.styles";

type Props = {
  label: string;
  selected: MealType[];
  isRTL: boolean;
  onToggle: (type: MealType) => void;
};

export function MealTypeBoxes({ label, selected, isRTL, onToggle }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, dir.text]}>{label}</Text>
      <ChoiceBoxes
        options={MEAL_TYPES.map((type) => ({ value: type, label: t(`mealTypesShort.${type}`) }))}
        selected={selected}
        onToggle={onToggle}
      />
    </View>
  );
}
