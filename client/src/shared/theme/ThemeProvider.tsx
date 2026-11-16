import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName } from "react-native";

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

function resolveThemeMode(themeMode: AppThemeMode): ResolvedTheme {
  return themeMode === "LIGHT" ? "light" : "dark";
}

export function AppThemeProvider({
  children,
  initialThemeMode = "DARK",
}: Props) {
  const [themeMode, setThemeMode] = useState<AppThemeMode>(initialThemeMode);

  const resolvedTheme = useMemo(
    () => resolveThemeMode(themeMode),
    [themeMode],
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
