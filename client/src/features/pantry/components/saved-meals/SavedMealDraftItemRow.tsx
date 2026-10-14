import { Text, TextInput, Pressable, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { SavedMealDraftItem } from "../../helpers/savedMealDraft";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/SavedMealDraftItemRow.styles";

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
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  const itemName =
    item.kind === "product" ? item.product.name : item.recipe.name;

  const itemSubtitle =
    item.kind === "product"
      ? (item.product.brand ??
        `${item.product.caloriesPer100g} ${t("product.calUnit")}/100${t(
          "product.gramsUnit",
        )}`)
      : `${item.recipe.totals.calories} ${t("product.calUnit")} / ${t(
          "savedMeal.servingsLabel",
        )}`;

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
    <View style={[styles.itemRow, dir.row]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, dir.text]} numberOfLines={1}>
          {itemName}
        </Text>

        <Text style={[styles.itemKind, dir.text]} numberOfLines={1}>
          {itemSubtitle}
        </Text>
      </View>

      <View style={[styles.amountBox, dir.row]}>
        <TextInput
          style={styles.amountInput}
          value={amountValue}
          onChangeText={(value) => onChangeAmount(item.key, value)}
          keyboardType="decimal-pad"
          placeholder={amountPlaceholder}
          placeholderTextColor={colors.textMuted}
          textAlign="center"
        />

        <Text style={styles.unitLabel}>{unitLabel}</Text>
      </View>

      <Pressable
        onPress={() => onRemove(item.key)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.removeBtn,
          pressed && styles.removeBtnPressed,
        ]}
      >
        <MaterialCommunityIcons
          name="close"
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}
