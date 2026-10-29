import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { RecipeIngredientDraft } from "../../helpers/recipeDraft";
import { hasServing } from "../../helpers/serving";
import { useServingFormat } from "../../hooks/useServingFormat";
import { AmountUnitInput } from "../shared/AmountUnitInput";
import { useDraftRowStyles } from "../shared/styles/DraftItemRow.styles";

type Props = {
  ingredient: RecipeIngredientDraft;
  isRTL: boolean;
  showBrand?: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onToggleUnit: (key: string) => void;
  onRemove: (key: string) => void;
};

export function RecipeIngredientDraftRow({
  ingredient,
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

  const meta = [
    showBrand ? ingredient.product.brand : null,
    hasServing(ingredient.product) ? format.perServing(ingredient.product) : null,
  ]
    .filter(Boolean)
    .join(" · ");

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

      <AmountUnitInput
        name={ingredient.product.name}
        value={ingredient.grams}
        unit={ingredient.unit}
        product={ingredient.product}
        onChangeValue={(value) => onChangeAmount(ingredient.key, value)}
        onToggleUnit={() => onToggleUnit(ingredient.key)}
      />

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
