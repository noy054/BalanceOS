import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { useAppTheme } from "../../../../shared/theme";
import { CategoryChips } from "../../../../shared/components/CategoryChips";
import { useStyles } from "./styles/RecipeIngredientPickerProductRow.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  product: PantryProduct;
  isSelected: boolean;
  dir: DirectionStyles;
  onPress: () => void;
};

export function RecipeIngredientPickerProductRow({
  product,
  isSelected,
  dir,
  onPress,
}: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const hasServing = product.servingSizeG != null && product.servingSizeG > 0;

  const displayCalories = hasServing
    ? Math.round((product.caloriesPer100g * product.servingSizeG!) / 100)
    : product.caloriesPer100g;

  const basisLabel = hasServing
    ? `${t("addProduct.perServing")} · ${product.servingSizeG}${t(
        "product.gramsUnit",
      )}`
    : `100${t("product.gramsUnit")}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        dir.row,
        isSelected && styles.itemSelected,
        pressed && styles.itemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, dir.text]} numberOfLines={1}>
          {product.name}
        </Text>

        {product.brand ? (
          <Text style={[styles.itemBrand, dir.text]} numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}

        <CategoryChips
          categories={product.mealCategories}
          isRTL={dir.row.flexDirection === "row-reverse"}
          style={{ marginTop: 4 }}
        />
      </View>

      <Text style={styles.itemCals} numberOfLines={1}>
        {displayCalories} {t("product.calUnit")} / {basisLabel}
      </Text>

      <View
        style={[styles.checkCircle, isSelected && styles.checkCircleActive]}
      >
        {isSelected ? (
          <MaterialCommunityIcons
            name="check"
            size={13}
            color={colors.background}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
