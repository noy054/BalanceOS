import { Pressable, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { PickerDraft } from "../../helpers/recipeIngredientPickerDraft";
import { useStyles } from "./styles/RecipeIngredientPickerSelectedRow.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  draft: PickerDraft;
  dir: DirectionStyles;
  onRemove: () => void;
  onChangeQuantity: (value: string) => void;
  onToggleUnit: () => void;
};

export function RecipeIngredientPickerSelectedRow({
  draft,
  dir,
  onRemove,
  onChangeQuantity,
  onToggleUnit,
}: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  return (
    <View style={[styles.selectedRow, dir.row]}>
      <View style={styles.selectedInfo}>
        <Text style={[styles.selectedName, dir.text]} numberOfLines={1}>
          {draft.product.name}
        </Text>

        {draft.product.servingSizeG ? (
          <Text style={[styles.selectedServing, dir.text]}>
            {t("addProduct.perServing")} · {draft.product.servingSizeG}
            {t("product.gramsUnit")}
          </Text>
        ) : null}
      </View>

      <View style={[styles.qtyBox, dir.row]}>
        <TextInput
          style={[styles.qtyInput, dir.input]}
          value={draft.quantity}
          onChangeText={onChangeQuantity}
          keyboardType="decimal-pad"
          placeholder={
            draft.unit === "servings"
              ? t("savedMeal.servingsPlaceholder")
              : t("recipe.gramsPlaceholder")
          }
          placeholderTextColor={colors.textMuted}
        />

        {draft.product.servingSizeG ? (
          <Pressable
            onPress={onToggleUnit}
            hitSlop={8}
            style={({ pressed }) => [
              styles.unitToggle,
              draft.unit === "servings" && styles.unitToggleActive,
              pressed && styles.unitTogglePressed,
            ]}
          >
            <Text
              style={[
                styles.unitToggleText,
                draft.unit === "servings" && styles.unitToggleTextActive,
              ]}
            >
              {draft.unit === "servings"
                ? t("recipe.servingsLabel")
                : t("recipe.gramsLabel")}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.unitLabel}>{t("recipe.gramsLabel")}</Text>
        )}
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={8}
        style={({ pressed }) => [
          styles.removeBtn,
          pressed && styles.removeBtnPressed,
        ]}
      >
        <MaterialCommunityIcons
          name="close"
          size={14}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}
