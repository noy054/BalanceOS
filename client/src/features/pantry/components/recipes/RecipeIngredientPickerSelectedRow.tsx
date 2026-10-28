import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { PickerDraft } from "../../helpers/recipeIngredientPickerDraft";
import { useDraftRowStyles } from "../shared/styles/DraftItemRow.styles";
import { AmountUnitInput } from "../shared/AmountUnitInput";
import { hasServing } from "../../helpers/serving";
import { useServingFormat } from "../../hooks/useServingFormat";

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
  const styles = useDraftRowStyles();
  const format = useServingFormat();

  return (
    <View style={[styles.row, dir.row]}>
      <View style={styles.info}>
        <Text style={[styles.name, dir.text]} numberOfLines={1}>
          {draft.product.name}
        </Text>

        {hasServing(draft.product) ? (
          <Text style={[styles.meta, dir.text]} numberOfLines={1}>
            {format.perServing(draft.product)}
          </Text>
        ) : null}
      </View>

      <AmountUnitInput
        name={draft.product.name}
        value={draft.quantity}
        unit={draft.unit}
        product={draft.product}
        onChangeValue={onChangeQuantity}
        onToggleUnit={onToggleUnit}
      />

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
