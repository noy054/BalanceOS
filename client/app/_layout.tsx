import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PaperProvider } from "react-native-paper";
import "../src/shared/i18n/i18n";
import { loadSavedLanguage } from "../src/shared/i18n";
import i18n from "../src/shared/i18n/i18n";
import { useAuthStore } from "../src/features/auth/hooks/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
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

useEffect(() => {
  async function resetLanguageForDebug() {
    await AsyncStorage.removeItem("balanceos_language");

    I18nManager.allowRTL(true);
    I18nManager.forceRTL(false);

    console.log("Language reset for debug");
  }

  resetLanguageForDebug();
}, []);

export default function RootLayout() {
  const setLanguageReady = useAuthStore((s) => s.setLanguageReady);
  const [rtlReady, setRtlReady] = useState(false);

  useEffect(() => {
    loadSavedLanguage().then(({ lang, wasSet }) => {
      if (wasSet) {
        I18nManager.forceRTL(lang === "he");
        if (i18n.language !== lang) i18n.changeLanguage(lang);
      }
      setLanguageReady(wasSet);
      setRtlReady(true);
    });
  }, []);

  if (!rtlReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider settings={{ icon }}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </QueryClientProvider>
  );
}
