import { Pressable, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { RecipeIngredientDraft } from "../../helpers/recipeDraft";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/RecipeIngredientDraftRow.styles";

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
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.ingredientRow, dir.row]}>
      <View style={styles.ingredientInfo}>
        <Text style={[styles.ingredientName, dir.text]} numberOfLines={1}>
          {ingredient.product.name}
        </Text>

        {ingredient.product.brand ? (
          <Text style={[styles.ingredientBrand, dir.text]} numberOfLines={1}>
            {ingredient.product.brand}
          </Text>
        ) : null}

        {ingredient.product.servingSizeG ? (
          <Text style={[styles.ingredientServing, dir.text]}>
            {t("addProduct.perServing")} · {ingredient.product.servingSizeG}
            {t("product.gramsUnit")}
          </Text>
        ) : null}
      </View>

      <View style={[styles.gramsBox, dir.row]}>
        <TextInput
          style={styles.gramsInput}
          value={ingredient.grams}
          onChangeText={(value) => onChangeAmount(ingredient.key, value)}
          keyboardType="decimal-pad"
          placeholder={
            ingredient.unit === "servings"
              ? t("savedMeal.servingsPlaceholder")
              : t("recipe.gramsPlaceholder")
          }
          placeholderTextColor={colors.textMuted}
          textAlign="center"
        />

        {ingredient.product.servingSizeG ? (
          <Pressable
            onPress={() => onToggleUnit(ingredient.key)}
            hitSlop={8}
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
          <Text style={styles.gramsLabel}>{t("recipe.gramsLabel")}</Text>
        )}
      </View>

      <Pressable
        onPress={() => onRemove(ingredient.key)}
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
