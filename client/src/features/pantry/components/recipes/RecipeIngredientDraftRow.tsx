import { Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { RecipeIngredientDraft } from "../../helpers/recipeDraft";
import { useDraftRowStyles } from "../shared/styles/DraftItemRow.styles";

type Props = {
  ingredient: RecipeIngredientDraft;
  isRTL: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onToggleUnit: (key: string) => void;
  onRemove: (key: string) => void;
};

export function RecipeIngredientDraftRow({
  ingredient,
  isRTL,
  onChangeAmount,
  onToggleUnit,
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

  const meta = [
    ingredient.product.brand,
    ingredient.product.servingSizeG
      ? `${t("addProduct.perServing")} · ${ingredient.product.servingSizeG} ${t("product.gramsUnit")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const placeholder =
    ingredient.unit === "servings"
      ? t("savedMeal.servingsPlaceholder")
      : t("recipe.gramsPlaceholder");

  return (
    <View style={[styles.row, row]}>
      <View style={styles.info}>
        <Text style={[styles.name, text]} numberOfLines={2}>
          {ingredient.product.name}
        </Text>

        {meta ? (
          <Text style={[styles.meta, text]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>

      <View style={[styles.amountBox, row]}>
        <TextInput
          style={styles.amountInput}
          value={ingredient.grams}
          onChangeText={(value) => onChangeAmount(ingredient.key, value)}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          textAlign="center"
          accessibilityLabel={`${ingredient.product.name}, ${placeholder}`}
        />

        {ingredient.product.servingSizeG ? (
          <Pressable
            onPress={() => onToggleUnit(ingredient.key)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("recipe.toggleUnit")}
            style={({ pressed }) => [
              styles.unitToggle,
              ingredient.unit === "servings" && styles.unitToggleActive,
              pressed && styles.unitTogglePressed,
            ]}
          >
            <Text
              style={[
                styles.unitToggleText,
                ingredient.unit === "servings" && styles.unitToggleTextActive,
              ]}
            >
              {ingredient.unit === "servings"
                ? t("recipe.servingsLabel")
                : t("recipe.gramsLabel")}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.unitLabel}>{t("recipe.gramsLabel")}</Text>
        )}
      </View>

      <IconButton
        icon="close"
        size={32}
        iconSize={18}
        accessibilityLabel={t("recipe.removeItemNamed", { name: ingredient.product.name })}
        onPress={() => onRemove(ingredient.key)}
      />
    </View>
  );
}
