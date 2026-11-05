import { useTranslation } from "react-i18next";

import { calculateRecipeDraftTotals, RecipeIngredientDraft } from "../../helpers/recipeDraft";
import { isAmbiguousName, useDuplicateNames } from "../../helpers/duplicateNames";
import { hasServing } from "../../helpers/serving";
import { useIngredientQuantityLabel } from "../../hooks/useIngredientQuantityLabel";
import { FOOD_ICONS } from "../../hooks/useFoodCardModels";
import { DraggableList } from "../form/DraggableList";
import { IngredientRow } from "../form/IngredientRow";
import { IngredientSection } from "../form/IngredientSection";
import { QuantityStepper } from "../form/QuantityStepper";
import { AmountUnitInput } from "../shared/AmountUnitInput";

type Props = {
  ingredients: RecipeIngredientDraft[];
  isRTL: boolean;
  onOpenProduct: (ingredient: RecipeIngredientDraft) => void;
  onChangeAmount: (key: string, value: string) => void;
  onToggleUnit: (key: string) => void;
  onRemoveIngredient: (key: string) => void;
  onAddIngredient: () => void;
  onMoveIngredient: (from: number, to: number) => void;
  onDragActiveChange?: (active: boolean) => void;
};

export function RecipeIngredientsCard({
  ingredients,
  onOpenProduct,
  onChangeAmount,
  onToggleUnit,
  onRemoveIngredient,
  onAddIngredient,
  onMoveIngredient,
  onDragActiveChange,
}: Props) {
  const { t } = useTranslation("pantry");
  const quantityLabel = useIngredientQuantityLabel();
  const duplicateNames = useDuplicateNames(
    ingredients.map((ingredient) => ingredient.product.name),
  );

  return (
    <IngredientSection
      title={t("recipe.ingredientsSection")}
      emptyText={t("form.noIngredients")}
      isEmpty={ingredients.length === 0}
      actions={[{ key: "add", label: t("recipe.addIngredient"), onPress: onAddIngredient }]}
    >
      <DraggableList
        items={ingredients}
        keyOf={(ingredient) => ingredient.key}
        labelOf={(ingredient) => ingredient.product.name}
        onMove={onMoveIngredient}
        onDragActiveChange={onDragActiveChange}
        renderItem={(ingredient, handle) => {
          const name = ingredient.product.name;
          const totals = calculateRecipeDraftTotals([ingredient]);
          const quantity = quantityLabel.product(ingredient.product, ingredient.grams, ingredient.unit);

          return (
            <IngredientRow
              name={name}
              meta={isAmbiguousName(duplicateNames, name) ? ingredient.product.brand : null}
              quantity={quantity.label}
              quantityHint={!quantity.missing && hasServing(ingredient.product) ? quantity.label : null}
              quantityMissing={quantity.missing}
              calories={totals.calories}
              macros={totals}
              imageUrl={ingredient.product.imageUrl}
              fallbackIcon={FOOD_ICONS.product}
              handle={handle}
              last={ingredient.key === ingredients[ingredients.length - 1]?.key}
              quantityLabel={t("ingredientEdit.quickEdit")}
              openLabel={t("ingredientEdit.editHint")}
              removeLabel={t("recipe.removeItemNamed", { name })}
              onOpen={() => onOpenProduct(ingredient)}
              quantityEditor={
                <QuantityStepper
                  value={ingredient.grams}
                  unit={ingredient.unit}
                  onChange={(value) => onChangeAmount(ingredient.key, value)}
                >
                  <AmountUnitInput
                    name={name}
                    value={ingredient.grams}
                    unit={ingredient.unit}
                    product={ingredient.product}
                    onChangeValue={(value) => onChangeAmount(ingredient.key, value)}
                    onToggleUnit={() => onToggleUnit(ingredient.key)}
                  />
                </QuantityStepper>
              }
              onRemove={() => onRemoveIngredient(ingredient.key)}
            />
          );
        }}
      />
    </IngredientSection>
  );
}
