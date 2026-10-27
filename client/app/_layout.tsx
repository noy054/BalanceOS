import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import "../src/shared/i18n/i18n";

import { loadSavedLanguage } from "../src/shared/i18n";
import i18n from "../src/shared/i18n/i18n";
import { useAuthStore } from "../src/features/auth/hooks/useAuthStore";
import {
  AppThemeMode,
  AppThemeProvider,
  loadSavedThemeMode,
  useAppTheme,
} from "../src/shared/theme";
import { PaperThemeBridge } from "../src/shared/theme/PaperThemeBridge";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function RootStack() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  const setLanguageReady = useAuthStore((state) => state.setLanguageReady);
  const [startupReady, setStartupReady] = useState(false);
  const [initialThemeMode, setInitialThemeMode] = useState<AppThemeMode>("DARK");

  useEffect(() => {
    Promise.all([loadSavedLanguage(), loadSavedThemeMode()]).then(
      ([{ lang, wasSet }, savedThemeMode]) => {
        const resolvedLang = wasSet ? lang : i18n.language;
        const shouldBeRTL = resolvedLang === "he";
        I18nManager.allowRTL(true);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.forceRTL(shouldBeRTL);
        }

        if (wasSet && i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }

        if (savedThemeMode) {
          setInitialThemeMode(savedThemeMode);
        }

        setLanguageReady(wasSet);
        setStartupReady(true);
      },
    );
  }, [setLanguageReady]);

  if (!startupReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider initialThemeMode={initialThemeMode}>
        <PaperThemeBridge>
          <RootStack />
        </PaperThemeBridge>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
