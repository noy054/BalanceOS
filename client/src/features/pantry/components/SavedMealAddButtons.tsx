import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { colors } from "../../../shared/theme";
import { styles } from "./styles/SavedMealForm.styles";

type Props = {
  isRTL: boolean;
  onAddProduct: () => void;
  onAddRecipe: () => void;
};

export function SavedMealAddButtons({
  isRTL,
  onAddProduct,
  onAddRecipe,
}: Props) {
  const { t } = useTranslation("pantry");

  return (
    <View
      style={[
        styles.addButtonsRow,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.addItemBtn,
          pressed && styles.addItemBtnPressed,
        ]}
        onPress={onAddProduct}
      >
        <MaterialCommunityIcons
          name="plus"
          size={17}
          color={colors.primaryGreen}
        />
        <Text style={styles.addItemText}>{t("savedMeal.addProductItem")}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.addItemBtn,
          pressed && styles.addItemBtnPressed,
        ]}
        onPress={onAddRecipe}
      >
        <MaterialCommunityIcons
          name="plus"
          size={17}
          color={colors.primaryGreen}
        />
        <Text style={styles.addItemText}>{t("savedMeal.addRecipeItem")}</Text>
      </Pressable>
    </View>
  );
}
