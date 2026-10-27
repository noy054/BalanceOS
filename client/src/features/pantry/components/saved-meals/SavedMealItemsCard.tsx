import { useTranslation } from "react-i18next";

import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SavedMealDraftItem } from "../../helpers/savedMealDraft";
import { SavedMealAddButtons } from "./SavedMealAddButtons";
import { SavedMealDraftItemRow } from "./SavedMealDraftItemRow";
import { useStyles } from "../recipes/styles/RecipeIngredientsCard.styles";

type Props = {
  items: SavedMealDraftItem[];
  isRTL: boolean;
  onChangeAmount: (key: string, value: string) => void;
  onRemoveItem: (key: string) => void;
  onAddProduct: () => void;
  onAddRecipe: () => void;
};

export function SavedMealItemsCard({
  items,
  isRTL,
  onChangeAmount,
  onRemoveItem,
  onAddProduct,
  onAddRecipe,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  return (
    <FormSection title={t("savedMeal.itemsSection")} contentStyle={styles.card}>
      {items.map((item) => (
        <SavedMealDraftItemRow
          key={item.key}
          item={item}
          isRTL={isRTL}
          onChangeAmount={onChangeAmount}
          onRemove={onRemoveItem}
        />
      ))}

      <SavedMealAddButtons
        isRTL={isRTL}
        onAddProduct={onAddProduct}
        onAddRecipe={onAddRecipe}
      />
    </FormSection>
  );
}
