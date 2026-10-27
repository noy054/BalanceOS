import { Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { PickerDraft } from "../../helpers/recipeIngredientPickerDraft";
import { useDraftRowStyles } from "../shared/styles/DraftItemRow.styles";

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
  const styles = useDraftRowStyles();

  const placeholder =
    draft.unit === "servings"
      ? t("savedMeal.servingsPlaceholder")
      : t("recipe.gramsPlaceholder");

  return (
    <View style={[styles.row, dir.row]}>
      <View style={styles.info}>
        <Text style={[styles.name, dir.text]} numberOfLines={1}>
          {draft.product.name}
        </Text>

        {draft.product.servingSizeG ? (
          <Text style={[styles.meta, dir.text]}>
            {t("addProduct.perServing")} · {draft.product.servingSizeG} {t("product.gramsUnit")}
          </Text>
        ) : null}
      </View>

      <View style={[styles.amountBox, dir.row]}>
        <TextInput
          style={styles.amountInput}
          value={draft.quantity}
          onChangeText={onChangeQuantity}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          textAlign="center"
          accessibilityLabel={`${draft.product.name}, ${placeholder}`}
        />

        {draft.product.servingSizeG ? (
          <Pressable
            onPress={onToggleUnit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("recipe.toggleUnit")}
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

      <IconButton
        icon="close"
        size={32}
        iconSize={18}
        accessibilityLabel={t("recipe.removeItemNamed", { name: draft.product.name })}
        onPress={onRemove}
      />
    </View>
  );
}
