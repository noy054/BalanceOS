import { Pressable, ScrollView, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { SettingsScreenLayout, useSettingsBottomPadding } from "../components/SettingsScreenLayout";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { SettingsSection } from "../components/SettingsSection";
import { useMarkets, useNutritionSettings, useUpdateSettings } from "../hooks/useSettings";
import { regionName } from "../../../shared/helpers/regionName";
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

  const { setThemeMode, themeMode, colors } = useAppTheme();
  const { i18n } = useTranslation();
  const { data: markets } = useMarkets();

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const currentLang = (settings?.preferredLanguage ??
    "he") as SupportedLanguage;
  const currentTheme: ThemeMode = themeMode;
  const currentMarket = settings?.marketCode ?? markets?.defaultCode ?? null;

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

        <SettingsSection title={t("languageDisplay.marketSection")}>
          <View style={styles.optionBlock}>
            <View accessibilityRole="radiogroup">
              {(markets?.markets ?? []).map((market) => {
                const selected = market.code === currentMarket;
                const label = regionName(market.code, i18n.language);
                return (
                  <Pressable
                    key={market.code}
                    onPress={() => updateSettings.mutate({ marketCode: market.code })}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    aria-checked={selected}
                    accessibilityLabel={label}
                    style={({ pressed }) => [styles.marketRow, dir.row, pressed && styles.marketRowPressed]}
                  >
                    <Text style={[styles.marketLabel, dir.text]} numberOfLines={1}>
                      {label}
                    </Text>
                    <MaterialCommunityIcons
                      name={selected ? "radiobox-marked" : "radiobox-blank"}
                      size={22}
                      color={selected ? colors.accent : colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.note, dir.text]}>{t("languageDisplay.marketNote")}</Text>
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
