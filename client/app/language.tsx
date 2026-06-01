import { Platform, Text, Pressable, View } from "react-native";
import * as Updates from "expo-updates";
import { router } from "expo-router";

import { useAuthStore } from "../src/features/auth/hooks/useAuthStore";
import { saveLanguage } from "../src/shared/i18n";
import type { SupportedLanguage } from "../src/shared/i18n";
import { styles } from "./styles/language.styles";

export default function LanguageScreen() {
  const setLanguageReady = useAuthStore((state) => state.setLanguageReady);

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
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Text style={styles.logoBalance}>Balance</Text>
        <Text style={styles.logoOS}>OS</Text>
      </View>
      <Text style={styles.title}>{"בחר שפה\nChoose your language"}</Text>

      <Pressable
        style={({ pressed }) => [styles.card, styles.cardActive, pressed && styles.cardPressed]}
        onPress={() => handleSelect("he")}
      >
        <Text style={styles.cardTitle}>עברית</Text>
        <Text style={styles.cardSub}>Hebrew · RTL</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>מומלץ · Recommended</Text>
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleSelect("en")}
      >
        <Text style={styles.cardTitle}>English</Text>
        <Text style={styles.cardSub}>אנגלית · LTR</Text>
      </Pressable>
    </View>
  );
}
