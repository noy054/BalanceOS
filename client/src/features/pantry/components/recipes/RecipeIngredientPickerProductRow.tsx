import { View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { PantryProduct } from "../../types";
import { useAppTheme } from "../../../../shared/theme";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";
import { useStyles } from "./styles/RecipeIngredientPickerProductRow.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  product: PantryProduct;
  showBrand?: boolean;
  isSelected: boolean;
  dir: DirectionStyles;
  onPress: () => void;
};

export function RecipeIngredientPickerProductRow({
  product,
  showBrand = false,
  isSelected,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const models = useFoodCardModels();

  return (
    <FoodItemCard
      {...models.product(product, showBrand)}
      selected={isSelected}
      onPress={onPress}
      trailing={
        <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
          {isSelected ? (
            <MaterialCommunityIcons name="check" size={14} color={colors.onAccent} />
          ) : null}
        </View>
      }
    />
  );
}
