import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { PantryProduct } from "../../types";
import { NutritionRow } from "../nutrition/NutritionRow";
import { getDirectionStyles } from "../../screens/styles/ProductDetailScreen.styles";
import { useStyles } from "./styles/NutritionFactsCard.styles";

type Props = {
  product: PantryProduct;
  t: TFunction<"pantry">;
  isRTL: boolean;
};

function r1(n: number) {
  return Math.round(n * 10) / 10;
}

export function NutritionFactsCard({ product, t, isRTL }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  const hasServing = product.servingSizeG != null && product.servingSizeG > 0;
  const mul = hasServing ? product.servingSizeG! / 100 : 1;

  const displayCalories = r1(product.caloriesPer100g * mul);
  const displayProtein = r1(product.proteinPer100g * mul);
  const displayCarbs = r1(product.carbsPer100g * mul);
  const displayFat = r1(product.fatPer100g * mul);
  const displayFiber =
    product.fiberPer100g != null ? r1(product.fiberPer100g * mul) : null;

  const sectionLabel = hasServing
    ? t("productDetail.nutritionPerServing", { size: product.servingSizeG })
    : t("productDetail.nutritionSection");

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

      <Text style={[styles.heroLabel, dir.text]}>{sectionLabel}</Text>

      <View style={styles.nutritionGrid}>
        <NutritionRow
          label={t("macros.calories")}
          value={displayCalories}
          unit={t("product.calUnit")}
          highlight
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.protein")}
          value={displayProtein}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.carbs")}
          value={displayCarbs}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.fat")}
          value={displayFat}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        {displayFiber != null ? (
          <NutritionRow
            label={t("macros.fiber")}
            value={displayFiber}
            unit={t("product.gramsUnit")}
            last
            isRTL={isRTL}
          />
        ) : null}
      </View>
    </View>
  );
}
