import { memo } from "react";

import { useFoodCardModels } from "../../pantry/hooks/useFoodCardModels";
import { PantryProduct, PantryRecipe, SavedMeal } from "../../pantry/types";
import { SelectedItem } from "../hooks/useMealSelection";
import { FoodPickRow } from "./FoodPickRow";

type Select = (entry: SelectedItem) => void;

export const ProductPickRow = memo(function ProductPickRow({
  product,
  ambiguous,
  selected,
  onSelect,
}: {
  product: PantryProduct;
  ambiguous: boolean;
  selected: boolean;
  onSelect: Select;
}) {
  const models = useFoodCardModels();
  return (
    <FoodPickRow
      model={models.product(product, ambiguous)}
      selected={selected}
      onPress={() => onSelect({ kind: "product", item: product })}
    />
  );
});

export const RecipePickRow = memo(function RecipePickRow({
  recipe,
  selected,
  onSelect,
}: {
  recipe: PantryRecipe;
  selected: boolean;
  onSelect: Select;
}) {
  const models = useFoodCardModels();
  return (
    <FoodPickRow
      model={models.recipe(recipe)}
      selected={selected}
      onPress={() => onSelect({ kind: "recipe", item: recipe })}
    />
  );
});

export const SavedMealPickRow = memo(function SavedMealPickRow({
  meal,
  selected,
  onSelect,
}: {
  meal: SavedMeal;
  selected: boolean;
  onSelect: Select;
}) {
  const models = useFoodCardModels();
  return (
    <FoodPickRow
      model={models.savedMeal(meal)}
      selected={selected}
      onPress={() => onSelect({ kind: "savedMeal", item: meal })}
    />
  );
});
