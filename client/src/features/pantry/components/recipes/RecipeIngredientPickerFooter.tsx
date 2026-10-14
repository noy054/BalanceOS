import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useStyles } from "./styles/RecipeIngredientPickerFooter.styles";

type Props = {
  selectedCount: number;
  onAdd: () => void;
};

export function RecipeIngredientPickerFooter({ selectedCount, onAdd }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  const isDisabled = selectedCount === 0;

  return (
    <View style={styles.footer}>
      <Pressable
        style={({ pressed }) => [
          styles.addBtn,
          isDisabled && styles.addBtnDisabled,
          pressed && !isDisabled && styles.addBtnPressed,
        ]}
        onPress={onAdd}
        disabled={isDisabled}
      >
        <Text style={styles.addBtnText}>
          {t("recipe.addSelectedBtnClean", {
            defaultValue: "הוסף למתכון",
          })}
        </Text>
      </Pressable>
    </View>
  );
}
