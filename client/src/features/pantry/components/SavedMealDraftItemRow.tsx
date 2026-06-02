import { Text, TextInput, Pressable, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { colors } from "../../../shared/theme";
import { SavedMealDraftItem } from "../helpers/savedMealDraft";
import { styles } from "./styles/SavedMealForm.styles";

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

  const textDirection = {
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
  };

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

  return (
    <View
      style={[styles.itemRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
    >
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, textDirection]} numberOfLines={1}>
          {itemName}
        </Text>

        <Text style={[styles.itemKind, textDirection]} numberOfLines={1}>
          {itemSubtitle}
        </Text>
      </View>

      <View
        style={[
          styles.amountBox,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <TextInput
          style={styles.amountInput}
          value={item.kind === "product" ? item.grams : item.servings}
          onChangeText={(value) => onChangeAmount(item.key, value)}
          keyboardType="decimal-pad"
          placeholder={
            item.kind === "product"
              ? t("savedMeal.gramsPlaceholder")
              : t("savedMeal.servingsPlaceholder")
          }
          placeholderTextColor={colors.textMuted}
          textAlign="center"
        />

        <Text style={styles.unitLabel}>
          {item.kind === "product"
            ? t("savedMeal.gramsLabel")
            : t("savedMeal.servingsLabel")}
        </Text>
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
