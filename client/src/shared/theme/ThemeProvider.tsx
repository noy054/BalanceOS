import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

import { AppColors, AppThemeMode, darkColors, lightColors } from "./colors";

type AppThemeContextValue = {
  colors: AppColors;
  themeMode: AppThemeMode;
  resolvedTheme: Exclude<ColorSchemeName, null>;
  setThemeMode: (mode: AppThemeMode) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialThemeMode?: AppThemeMode;
};

export function AppThemeProvider({
  children,
  initialThemeMode = "DARK",
}: Props) {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<AppThemeMode>(initialThemeMode);

  const resolvedTheme = useMemo(() => {
    if (themeMode === "SYSTEM") {
      return systemTheme === "light" ? "light" : "dark";
    }

    return themeMode === "LIGHT" ? "light" : "dark";
  }, [systemTheme, themeMode]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors: resolvedTheme === "light" ? lightColors : darkColors,
      themeMode,
      resolvedTheme,
      setThemeMode,
    }),
    [resolvedTheme, themeMode],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
}
