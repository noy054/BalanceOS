import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/SavedMealAddButtons.styles";

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
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.addButtonsRow, dir.row]}>
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
