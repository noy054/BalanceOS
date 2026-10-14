import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

import { AppColors, AppThemeMode, darkColors, lightColors } from "./colors";

type ResolvedTheme = Exclude<ColorSchemeName, null | undefined>;

type AppThemeContextValue = {
  colors: AppColors;
  themeMode: AppThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: AppThemeMode) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialThemeMode?: AppThemeMode;
};

function resolveThemeMode(
  themeMode: AppThemeMode,
  systemTheme: ColorSchemeName,
): ResolvedTheme {
  if (themeMode === "SYSTEM") {
    return systemTheme === "dark" ? "dark" : "light";
  }

  return themeMode === "DARK" ? "dark" : "light";
}

export function AppThemeProvider({
  children,
  initialThemeMode = "SYSTEM",
}: Props) {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<AppThemeMode>(initialThemeMode);

  const resolvedTheme = useMemo(
    () => resolveThemeMode(themeMode, systemTheme),
    [themeMode, systemTheme],
  );

  const colors = useMemo(
    () => (resolvedTheme === "light" ? lightColors : darkColors),
    [resolvedTheme],
  );

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors,
      themeMode,
      resolvedTheme,
      setThemeMode,
    }),
    [colors, themeMode, resolvedTheme],
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
