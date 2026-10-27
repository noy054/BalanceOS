import { useTranslation } from "react-i18next";

import { SavedMeal } from "../../types";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { FoodItemCard } from "../food/FoodItemCard";
import { useFoodCardModels } from "../../hooks/useFoodCardModels";

type Props = {
  meal: SavedMeal;
  onPress: (meal: SavedMeal) => void;
  onMore?: (meal: SavedMeal) => void;
};

export function SavedMealCard({ meal, onPress, onMore }: Props) {
  const { t } = useTranslation("pantry");
  const models = useFoodCardModels();

  return (
    <FoodItemCard
      {...models.savedMeal(meal)}
      onPress={() => onPress(meal)}
      trailing={
        onMore ? (
          <IconButton
            icon="dots-vertical"
            size={36}
            iconSize={20}
            accessibilityLabel={t("common.moreOptionsFor", { name: meal.name })}
            onPress={() => onMore(meal)}
          />
        ) : null
      }
    />
  );
}
