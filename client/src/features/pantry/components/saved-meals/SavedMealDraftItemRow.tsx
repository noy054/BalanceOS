import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { formatCalories } from "../../../../shared/helpers/formatNumber";
import { SavedMealDraftItem } from "../../helpers/savedMealDraft";
import { useDraftRowStyles } from "../shared/styles/DraftItemRow.styles";

type Props = {
  item: SavedMealDraftItem;
  isRTL: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onRemove: (key: string) => void;
};

export function SavedMealDraftItemRow({
  item,
  isRTL,
  onChangeAmount,
  onRemove,
}: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useDraftRowStyles();

  const row = { flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const) };
  const text = {
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
  };

  const itemName =
    item.kind === "product" ? item.product.name : item.recipe.name;

  const itemSubtitle =
    item.kind === "product"
      ? (item.product.brand ??
        `${formatCalories(item.product.caloriesPer100g)} ${t("product.calUnit")} · ${t("product.per100g")}`)
      : `${formatCalories(item.recipe.totals.calories)} ${t("product.calUnit")} · ${t("foodCard.recipeTotal")}`;

  const amountValue = item.kind === "product" ? item.grams : item.servings;

  const amountPlaceholder =
    item.kind === "product"
      ? t("savedMeal.gramsPlaceholder")
      : t("savedMeal.servingsPlaceholder");

  const unitLabel =
    item.kind === "product"
      ? t("savedMeal.gramsLabel")
      : t("savedMeal.servingsLabel");

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

      <View style={[styles.amountBox, row]}>
        <TextInput
          style={styles.amountInput}
          value={amountValue}
          onChangeText={(value) => onChangeAmount(item.key, value)}
          keyboardType="decimal-pad"
          placeholder={amountPlaceholder}
          placeholderTextColor={colors.textMuted}
          textAlign="center"
          accessibilityLabel={`${itemName}, ${amountPlaceholder}`}
        />

        <Text style={styles.unitLabel}>{unitLabel}</Text>
      </View>

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
