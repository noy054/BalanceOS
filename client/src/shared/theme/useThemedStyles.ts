import { useMemo, useRef } from "react";

import { AppColors } from "./colors";
import { useAppTheme } from "./ThemeProvider";

export function useThemedStyles<T>(factory: (colors: AppColors) => T): T {
  const { colors } = useAppTheme();
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  // factory is excluded from deps intentionally — it's always a new inline
  // arrow, so including it would defeat the memoization entirely.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factoryRef.current(colors), [colors]);
}
