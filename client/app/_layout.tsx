import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_600SemiBold,
  Heebo_700Bold,
} from "@expo-google-fonts/heebo";
import {
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from "@expo-google-fonts/rubik";

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
import { ConfirmDialogHost } from "../src/shared/components/ui/ConfirmDialogHost";

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
  const [fontsLoaded, fontError] = useFonts({
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });
  const [initialThemeMode, setInitialThemeMode] = useState<AppThemeMode>("DARK");

  useEffect(() => {
    Promise.all([loadSavedLanguage(), loadSavedThemeMode()]).then(
      ([{ lang, wasSet }, savedThemeMode]) => {
        I18nManager.allowRTL(false);
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
          Updates.reloadAsync().catch(() => undefined);
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

  if (!startupReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider initialThemeMode={initialThemeMode}>
        <PaperThemeBridge>
          <RootStack />
          <ConfirmDialogHost />
        </PaperThemeBridge>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
