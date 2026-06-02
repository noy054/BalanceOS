import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";

import "../src/shared/i18n/i18n";

import { loadSavedLanguage } from "../src/shared/i18n";
import i18n from "../src/shared/i18n/i18n";
import { useAuthStore } from "../src/features/auth/hooks/useAuthStore";
import { AppThemeProvider } from "../src/shared/theme";

// Applied only to auth + onboarding screens — no other screens use Paper components.
const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#31D86B",                        // brand green — focus ring, active label
    background: "#080C0A",                     // matches ScreenShell background
    surface: "rgba(255, 255, 255, 0.09)",      // input fill
    outline: "rgba(255, 255, 255, 0.20)",      // unfocused border
    onSurface: "#FFFFFF",                      // input text
    onSurfaceVariant: "rgba(255, 255, 255, 0.55)", // unfocused label / placeholder
    error: "#F84B6A",
    onError: "#FFFFFF",
  },
};

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

function icon({
  name,
  color,
  size,
}: {
  name: string;
  color?: string;
  size: number;
}) {
  return (
    <MaterialCommunityIcons
      name={name as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
      color={color ?? "#000"}
      size={size}
    />
  );
}

export default function RootLayout() {
  const setLanguageReady = useAuthStore((state) => state.setLanguageReady);
  const [rtlReady, setRtlReady] = useState(false);

  useEffect(() => {
    loadSavedLanguage().then(({ lang, wasSet }) => {
      if (wasSet) {
        I18nManager.forceRTL(lang === "he");

        if (i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }
      }

      setLanguageReady(wasSet);
      setRtlReady(true);
    });
  }, [setLanguageReady]);

  if (!rtlReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider initialThemeMode="DARK">
        <PaperProvider theme={paperTheme} settings={{ icon }}>
          <Stack screenOptions={{ headerShown: false }} />
        </PaperProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
