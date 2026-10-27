import { useTranslation } from "react-i18next";

import { PantryRecipe } from "../../types";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";

type Props = {
  recipe: PantryRecipe;
  onPress: (recipe: PantryRecipe) => void;
  onMore?: (recipe: PantryRecipe) => void;
};

export function RecipeCard({ recipe, onPress, onMore }: Props) {
  const { t } = useTranslation("pantry");
  const models = useFoodCardModels();

  return (
    <FoodItemCard
      {...models.recipe(recipe)}
      onPress={() => onPress(recipe)}
      trailing={
        onMore ? (
          <IconButton
            icon="dots-vertical"
            size={36}
            iconSize={20}
            accessibilityLabel={t("common.moreOptionsFor", { name: recipe.name })}
            onPress={() => onMore(recipe)}
          />
        ) : null
      }
    />
  );
}
