import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { formatCalories } from "../../../../shared/helpers/formatNumber";
import { SavedMealDraftItem } from "../../helpers/savedMealDraft";
import { useDraftRowStyles } from "../shared/styles/DraftItemRow.styles";
import { AmountUnitInput } from "../shared/AmountUnitInput";
import { hasServing } from "../../helpers/serving";
import { useServingFormat } from "../../hooks/useServingFormat";

type Props = {
  item: SavedMealDraftItem;
  isRTL: boolean;
  showBrand?: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onToggleUnit: (key: string) => void;
  onRemove: (key: string) => void;
};

export function SavedMealDraftItemRow({
  item,
  isRTL,
  showBrand = false,
  onChangeAmount,
  onToggleUnit,
  onRemove,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useDraftRowStyles();
  const format = useServingFormat();

  const row = { flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const) };
  const text = {
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
  };

  const itemName =
    item.kind === "product" ? item.product.name : item.recipe.name;

  const itemSubtitle =
    item.kind === "product"
      ? [
          showBrand ? item.product.brand : null,
          hasServing(item.product)
            ? format.perServing(item.product)
            : `${formatCalories(item.product.caloriesPer100g)} ${t("product.calUnit")} · ${t("product.per100g")}`,
        ]
          .filter(Boolean)
          .join(" · ")
      : `${formatCalories(item.recipe.totals.calories)} ${t("product.calUnit")} · ${t("foodCard.recipeTotal")}`;

  return (
    <View style={[styles.row, row]}>
      <View style={styles.info}>
        <Text style={[styles.name, text]} numberOfLines={2}>
          {itemName}
        </Text>

        <Text style={[styles.meta, text]} numberOfLines={1}>
          {itemSubtitle}
        </Text>
      </View>

      {item.kind === "product" ? (
        <AmountUnitInput
          name={itemName}
          value={item.grams}
          unit={item.unit}
          product={item.product}
          onChangeValue={(value) => onChangeAmount(item.key, value)}
          onToggleUnit={() => onToggleUnit(item.key)}
        />
      ) : (
        <AmountUnitInput
          name={itemName}
          value={item.servings}
          unit="servings"
          fixedUnitLabel={t("savedMeal.servingsLabel")}
          onChangeValue={(value) => onChangeAmount(item.key, value)}
        />
      )}

      <IconButton
        icon="close"
        size={32}
        iconSize={18}
        accessibilityLabel={t("recipe.removeItemNamed", { name: itemName })}
        onPress={() => onRemove(item.key)}
      />
    </View>
  );
}
