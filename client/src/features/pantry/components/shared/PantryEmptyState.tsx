import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { StateView } from "../../../../shared/components/ui/StateView";
import { PantryTab } from "../../types";
import { FOOD_ICONS } from "../../hooks/useFoodCardModels";

const CONFIG: Record<
  PantryTab,
  {
    icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
    messageKey: string;
    hintKey: string;
  }
> = {
  products: {
    icon: FOOD_ICONS.product,
    messageKey: "empty.products",
    hintKey: "empty.productsHint",
  },
  recipes: {
    icon: FOOD_ICONS.recipe,
    messageKey: "empty.recipes",
    hintKey: "empty.recipesHint",
  },
  savedMeals: {
    icon: FOOD_ICONS.savedMeal,
    messageKey: "empty.savedMeals",
    hintKey: "empty.savedMealsHint",
  },
};

type Props = {
  tab: PantryTab;
};

export function PantryEmptyState({ tab }: Props) {
  const { t } = useTranslation("pantry");
  const config = CONFIG[tab];

  return (
    <StateView
      variant="empty"
      icon={config.icon}
      title={t(config.messageKey as Parameters<typeof t>[0])}
      message={t(config.hintKey as Parameters<typeof t>[0])}
    />
  );
}
