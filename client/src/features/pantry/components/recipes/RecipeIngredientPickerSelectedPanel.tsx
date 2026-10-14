import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { PickerDraft } from "../../helpers/recipeIngredientPickerDraft";
import { RecipeIngredientPickerSelectedRow } from "./RecipeIngredientPickerSelectedRow";
import { useStyles } from "./styles/RecipeIngredientPickerSelectedPanel.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  drafts: PickerDraft[];
  selectedCount: number;
  dir: DirectionStyles;
  onToggleProduct: (product: PantryProduct) => void;
  onChangeQuantity: (id: string, quantity: string) => void;
  onToggleUnit: (id: string) => void;
};

export function RecipeIngredientPickerSelectedPanel({
  drafts,
  selectedCount,
  dir,
  onToggleProduct,
  onChangeQuantity,
  onToggleUnit,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  return (
    <View style={styles.selectedPanel}>
      <Text style={[styles.selectedHeader, dir.text]}>
        {t("recipe.selectedSection", { count: selectedCount })}
      </Text>

      <ScrollView
        style={styles.selectedScroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {drafts.map((draft) => (
          <RecipeIngredientPickerSelectedRow
            key={draft.product.id}
            draft={draft}
            dir={dir}
            onRemove={() => onToggleProduct(draft.product)}
            onChangeQuantity={(value) =>
              onChangeQuantity(draft.product.id, value)
            }
            onToggleUnit={() => onToggleUnit(draft.product.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
