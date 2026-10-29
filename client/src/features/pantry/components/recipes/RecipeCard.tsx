import { useTranslation } from "react-i18next";

import { PantryRecipe } from "../../types";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";

type Props = {
  recipe: PantryRecipe;
  onPress: (recipe: PantryRecipe) => void;
  onEdit?: (recipe: PantryRecipe) => void;
  onMore?: (recipe: PantryRecipe) => void;
};

export function RecipeCard({ recipe, onPress, onEdit, onMore }: Props) {
  const { t } = useTranslation("pantry");
  const models = useFoodCardModels();

  return (
    <FoodItemCard
      {...models.recipe(recipe)}
      onPress={() => onPress(recipe)}
      onLongPress={onMore ? () => onMore(recipe) : undefined}
      actions={
        onEdit ? (
          <IconButton
            icon="pencil-outline"
            variant="tonal"
            size={40}
            iconSize={20}
            accessibilityLabel={t("common.editItem", { name: recipe.name })}
            onPress={() => onEdit(recipe)}
          />
        ) : null
      }
    />
  );
}
