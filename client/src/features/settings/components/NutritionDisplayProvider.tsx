import { createContext, ReactNode, useContext, useMemo } from "react";

import { useNutritionSettings } from "../hooks/useSettings";

export type NutritionDisplay = {
  showCarbs: boolean;
  showFat: boolean;
  showFiber: boolean;
  showPercentages: boolean;
};

const DEFAULT_DISPLAY: NutritionDisplay = {
  showCarbs: true,
  showFat: true,
  showFiber: true,
  showPercentages: true,
};

const NutritionDisplayContext = createContext<NutritionDisplay>(DEFAULT_DISPLAY);

export function NutritionDisplayProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useNutritionSettings();

  const showCarbs = settings?.showCarbsOnHome ?? true;
  const showFat = settings?.showFatOnHome ?? true;
  const showFiber = settings?.showFiberOnHome ?? true;
  const showPercentages = settings?.showProgressPercentages ?? true;

  const value = useMemo(
    () => ({ showCarbs, showFat, showFiber, showPercentages }),
    [showCarbs, showFat, showFiber, showPercentages],
  );

  return (
    <NutritionDisplayContext.Provider value={value}>{children}</NutritionDisplayContext.Provider>
  );
}

export function useNutritionDisplay() {
  return useContext(NutritionDisplayContext);
}
