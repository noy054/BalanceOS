import { useNutritionSettings } from "../../settings/hooks/useSettings";

export function useMacroVisibility() {
  const { data: settings } = useNutritionSettings();

  return {
    showCarbs: settings?.showCarbsOnHome ?? true,
    showFat: settings?.showFatOnHome ?? true,
    showFiber: settings?.showFiberOnHome ?? true,
    showPercentages: settings?.showProgressPercentages ?? true,
  };
}
