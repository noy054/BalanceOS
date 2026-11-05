import { useTranslation } from "react-i18next";

import { calculateSavedMealDraftTotals, SavedMealDraftItem } from "../../helpers/savedMealDraft";
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
  items: SavedMealDraftItem[];
  isRTL: boolean;
  onOpenProduct: (item: SavedMealDraftItem) => void;
  onChangeAmount: (key: string, value: string) => void;
  onToggleUnit: (key: string) => void;
  onRemoveItem: (key: string) => void;
  onAddProduct: () => void;
  onAddRecipe: () => void;
  onMoveItem: (from: number, to: number) => void;
  onDragActiveChange?: (active: boolean) => void;
};

function itemName(item: SavedMealDraftItem) {
  return item.kind === "product" ? item.product.name : item.recipe.name;
}

function recipeImage(item: SavedMealDraftItem) {
  if (item.kind !== "recipe") return null;
  if ("imageUrl" in item.recipe && item.recipe.imageUrl) return item.recipe.imageUrl;
  return item.recipe.items.find((entry) => entry.product?.imageUrl)?.product?.imageUrl ?? null;
}

export function SavedMealItemsCard({
  items,
  onOpenProduct,
  onChangeAmount,
  onToggleUnit,
  onRemoveItem,
  onAddProduct,
  onAddRecipe,
  onMoveItem,
  onDragActiveChange,
}: Props) {
  const { t } = useTranslation("pantry");
  const quantityLabel = useIngredientQuantityLabel();
  const duplicateNames = useDuplicateNames(items.map(itemName));

  return (
    <IngredientSection
      title={t("savedMeal.itemsSection")}
      emptyText={t("form.noItems")}
      isEmpty={items.length === 0}
      actions={[
        { key: "product", label: t("savedMeal.addProductItem"), onPress: onAddProduct },
        { key: "recipe", label: t("savedMeal.addRecipeItem"), onPress: onAddRecipe },
      ]}
    >
      <DraggableList
        items={items}
        keyOf={(item) => item.key}
        labelOf={itemName}
        onMove={onMoveItem}
        onDragActiveChange={onDragActiveChange}
        renderItem={(item, handle) => {
          const name = itemName(item);
          const totals = calculateSavedMealDraftTotals([item]);
          const quantity =
            item.kind === "product"
              ? quantityLabel.product(item.product, item.grams, item.unit)
              : quantityLabel.recipe(item.servings);

          return (
            <IngredientRow
              name={name}
              meta={
                item.kind === "product" && isAmbiguousName(duplicateNames, name)
                  ? item.product.brand
                  : null
              }
              quantity={quantity.label}
              quantityHint={
                item.kind === "product" && !quantity.missing && hasServing(item.product) ? quantity.label : null
              }
              quantityMissing={quantity.missing}
              calories={totals.calories}
              macros={totals}
              imageUrl={item.kind === "product" ? item.product.imageUrl : recipeImage(item)}
              fallbackIcon={item.kind === "product" ? FOOD_ICONS.product : FOOD_ICONS.recipe}
              handle={handle}
              last={item.key === items[items.length - 1]?.key}
              quantityLabel={t("ingredientEdit.quickEdit")}
              openLabel={t("ingredientEdit.editHint")}
              removeLabel={t("recipe.removeItemNamed", { name })}
              onOpen={item.kind === "product" ? () => onOpenProduct(item) : undefined}
              quantityEditor={
                item.kind === "product" ? (
                  <QuantityStepper
                    value={item.grams}
                    unit={item.unit}
                    onChange={(value) => onChangeAmount(item.key, value)}
                  >
                    <AmountUnitInput
                      name={name}
                      value={item.grams}
                      unit={item.unit}
                      product={item.product}
                      onChangeValue={(value) => onChangeAmount(item.key, value)}
                      onToggleUnit={() => onToggleUnit(item.key)}
                    />
                  </QuantityStepper>
                ) : (
                  <QuantityStepper
                    value={item.servings}
                    unit="servings"
                    onChange={(value) => onChangeAmount(item.key, value)}
                  >
                    <AmountUnitInput
                      name={name}
                      value={item.servings}
                      unit="servings"
                      fixedUnitLabel={t("savedMeal.servingsLabel")}
                      onChangeValue={(value) => onChangeAmount(item.key, value)}
                    />
                  </QuantityStepper>
                )
              }
              onRemove={() => onRemoveItem(item.key)}
            />
          );
        }}
      />
    </IngredientSection>
  );
}
