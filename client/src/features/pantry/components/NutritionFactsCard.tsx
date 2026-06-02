import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { colors } from "../../../shared/theme";
import { PantryProduct } from "../types";
import { NutritionRow } from "./NutritionRow";
import { getDirectionStyles } from "../screens/styles/ProductDetailScreen.styles";
import { styles } from "./styles/NutritionFactsCard.styles";

type Props = {
  product: PantryProduct;
  t: TFunction<"pantry">;
  isRTL: boolean;
};

export function NutritionFactsCard({ product, t, isRTL }: Props) {
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.heroCard}>
      <View style={[styles.productMetaRow, dir.row]}>
        {product.brand ? (
          <View style={styles.metaChip}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={15}
              color={colors.primaryGreen}
            />
            <Text style={styles.metaChipText}>{product.brand}</Text>
          </View>
        ) : null}

        {product.barcode ? (
          <View style={styles.metaChip}>
            <MaterialCommunityIcons
              name="barcode"
              size={15}
              color={colors.textSecondary}
            />
            <Text style={styles.metaChipText}>{product.barcode}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.heroLabel, dir.text]}>
        {t("productDetail.nutritionSection")}
      </Text>

      <View style={styles.nutritionGrid}>
        <NutritionRow
          label={t("macros.calories")}
          value={product.caloriesPer100g}
          unit={t("product.calUnit")}
          highlight
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.protein")}
          value={product.proteinPer100g}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.carbs")}
          value={product.carbsPer100g}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.fat")}
          value={product.fatPer100g}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        {product.fiberPer100g != null ? (
          <NutritionRow
            label={t("macros.fiber")}
            value={product.fiberPer100g}
            unit={t("product.gramsUnit")}
            last
            isRTL={isRTL}
          />
        ) : null}
      </View>
    </View>
  );
}
