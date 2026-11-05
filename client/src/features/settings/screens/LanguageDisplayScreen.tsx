import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SettingsScreenLayout, useSettingsBottomPadding } from "../components/SettingsScreenLayout";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { SettingsSection } from "../components/SettingsSection";
import { useNutritionSettings, useUpdateSettings } from "../hooks/useSettings";
import { saveLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from "../../../shared/i18n";
import { ThemeMode } from "../types";
import { saveThemeMode, useAppTheme } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { useSubScreenStyles } from "./styles/SettingsSubScreen.styles";

export function LanguageDisplayScreen() {
  const { t } = useTranslation("settings");
  const styles = useSubScreenStyles();
  const dir = useDirection();
  const bottomPadding = useSettingsBottomPadding();

  const { setThemeMode, themeMode } = useAppTheme();

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const currentLang = (settings?.preferredLanguage ??
    "he") as SupportedLanguage;
  const currentTheme = (settings?.themeMode ?? themeMode) as ThemeMode;

  async function handleLanguageChange(lang: SupportedLanguage) {
    await saveLanguage(lang);
    updateSettings.mutate({ preferredLanguage: lang });
  }

  function handleThemeChange(theme: ThemeMode) {
    setThemeMode(theme);
    saveThemeMode(theme);
    updateSettings.mutate({ themeMode: theme });
  }

  return (
    <SettingsScreenLayout title={t("languageDisplay.screenTitle")}>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, bottomPadding]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title={t("languageDisplay.languageSection")}>
          <View style={styles.optionBlock}>
            <SegmentedControl
              options={[
                ...SUPPORTED_LANGUAGES.map((language) => ({
                  value: language,
                  label: t(`language.${language}`),
                })),
              ]}
              value={currentLang}
              onChange={handleLanguageChange}
              pill
            />

            <Text style={[styles.note, dir.text]}>{t("languageDisplay.rtlNote")}</Text>
          </View>
        </SettingsSection>

        <SettingsSection title={t("languageDisplay.themeSection")}>
          <View style={styles.optionBlock}>
            <SegmentedControl
              options={[
                { value: "LIGHT" as ThemeMode, label: t("theme.light") },
                { value: "DARK" as ThemeMode, label: t("theme.dark") },
                { value: "SYSTEM" as ThemeMode, label: t("theme.system") },
              ]}
              value={currentTheme}
              onChange={handleThemeChange}
              pill
            />
          </View>
        </SettingsSection>
      </ScrollView>
    </SettingsScreenLayout>
  );
}
