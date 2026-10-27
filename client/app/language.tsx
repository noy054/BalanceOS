import { Platform, Text, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "../src/features/auth/hooks/useAuthStore";
import { saveLanguage } from "../src/shared/i18n";
import type { SupportedLanguage } from "../src/shared/i18n";
import { BrandMark } from "../src/shared/components/BrandMark";
import { useStyles } from "./styles/language.styles";

export default function LanguageScreen() {
  const setLanguageReady = useAuthStore((state) => state.setLanguageReady);
  const styles = useStyles();
  const { t } = useTranslation("common");
  const inHebrew = (key: string) => t(key, { lng: "he" });
  const inEnglish = (key: string) => t(key, { lng: "en" });
  const hebrewName = inHebrew("languagePicker.languages.he");
  const englishName = inEnglish("languagePicker.languages.en");

  async function handleSelect(lang: SupportedLanguage) {
    await saveLanguage(lang);
    setLanguageReady(true);
    if (Platform.OS === "web") {
      router.replace("/(auth)/login");
      return;
    }
    try {
      await Updates.reloadAsync();
    } catch {
      // reloadAsync throws in Expo Go / dev builds (no OTA runtime).
      // Fall back to in-process navigation so the app still responds.
      router.replace("/(auth)/login");
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <BrandMark size={30} style={styles.logo} />

        <Text style={styles.title}>
          {`${inHebrew("languagePicker.title")}
${inEnglish("languagePicker.title")}`}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.card, styles.cardActive, pressed && styles.cardPressed]}
          onPress={() => handleSelect("he")}
          accessibilityRole="button"
          accessibilityLabel={hebrewName}
        >
          <Text style={styles.cardTitle}>{hebrewName}</Text>
          <Text style={styles.cardSub}>
            {`${inEnglish("languagePicker.languages.he")} · ${inEnglish("languagePicker.rtl")}`}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {`${inHebrew("languagePicker.recommended")} · ${inEnglish("languagePicker.recommended")}`}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => handleSelect("en")}
          accessibilityRole="button"
          accessibilityLabel={englishName}
        >
          <Text style={styles.cardTitle}>{englishName}</Text>
          <Text style={styles.cardSub}>
            {`${inHebrew("languagePicker.languages.en")} · ${inHebrew("languagePicker.ltr")}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
