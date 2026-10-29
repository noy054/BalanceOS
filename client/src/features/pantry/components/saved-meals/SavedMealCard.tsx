import { useTranslation } from "react-i18next";

import { SavedMeal } from "../../types";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";

type Props = {
  meal: SavedMeal;
  onPress: (meal: SavedMeal) => void;
  onEdit?: (meal: SavedMeal) => void;
  onMore?: (meal: SavedMeal) => void;
};

export function SavedMealCard({ meal, onPress, onEdit, onMore }: Props) {
  const { t } = useTranslation("pantry");
  const models = useFoodCardModels();

  return (
    <FoodItemCard
      {...models.savedMeal(meal)}
      onPress={() => onPress(meal)}
      onLongPress={onMore ? () => onMore(meal) : undefined}
      actions={
        onEdit ? (
          <IconButton
            icon="pencil-outline"
            variant="tonal"
            size={40}
            iconSize={20}
            accessibilityLabel={t("common.editItem", { name: meal.name })}
            onPress={() => onEdit(meal)}
          />
        ) : null
      }
    />
  );
}
