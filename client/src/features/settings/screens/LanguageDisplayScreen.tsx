import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { SettingsSection } from '../components/SettingsSection';
import { useNutritionSettings, useUpdateSettings } from '../hooks/useSettings';
import { saveLanguage, SupportedLanguage } from '../../../shared/i18n/i18n';
import { ThemeMode } from '../types';
import { styles, getDirectionStyles } from './styles/LanguageDisplayScreen.styles';

type OptionChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function OptionChip({ label, active, disabled = false, onPress }: OptionChipProps) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function LanguageDisplayScreen() {
  const { t, i18n } = useTranslation('settings');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const currentLang = (settings?.preferredLanguage ?? 'he') as SupportedLanguage;
  const currentTheme = (settings?.themeMode ?? 'LIGHT') as ThemeMode;

  async function handleLanguageChange(lang: SupportedLanguage) {
    await saveLanguage(lang);
    updateSettings.mutate({ preferredLanguage: lang });
  }

  function handleThemeChange(theme: ThemeMode) {
    updateSettings.mutate({ themeMode: theme });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('languageDisplay.screenTitle')} />

      <View style={styles.content}>
        <SettingsSection title={t('languageDisplay.languageSection')}>
          <View style={[styles.optionRow, dir.row]}>
            <Text style={[styles.optionLabel, dir.text]}>{t('languageDisplay.languageSection')}</Text>
            <View style={[styles.chips, dir.chipsRow]}>
              <OptionChip
                label={t('language.he')}
                active={currentLang === 'he'}
                onPress={() => handleLanguageChange('he')}
              />
              <OptionChip
                label={t('language.en')}
                active={currentLang === 'en'}
                onPress={() => handleLanguageChange('en')}
              />
            </View>
          </View>
          <View style={styles.rtlNote}>
            <Text style={[styles.rtlNoteText, dir.text]}>{t('languageDisplay.rtlNote')}</Text>
          </View>
        </SettingsSection>

        <SettingsSection title={t('languageDisplay.themeSection')}>
          <View style={[styles.optionRow, dir.row]}>
            <Text style={[styles.optionLabel, dir.text]}>{t('languageDisplay.themeSection')}</Text>
            <View style={[styles.chips, dir.chipsRow]}>
              <OptionChip
                label={t('theme.light')}
                active={currentTheme === 'LIGHT'}
                onPress={() => handleThemeChange('LIGHT')}
              />
              <OptionChip
                label={t('theme.dark')}
                active={currentTheme === 'DARK'}
                disabled
                onPress={() => {}}
              />
              <OptionChip
                label={t('theme.system')}
                active={currentTheme === 'SYSTEM'}
                disabled
                onPress={() => {}}
              />
            </View>
          </View>
          <View style={styles.darkComingSoon}>
            <Text style={[styles.darkComingSoonText, dir.text]}>{t('theme.darkComingSoon')}</Text>
          </View>
        </SettingsSection>
      </View>
    </SafeAreaView>
  );
}
