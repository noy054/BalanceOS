import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsToggleRow } from '../components/SettingsToggleRow';
import { useNutritionSettings, useUpdateSettings } from '../hooks/useSettings';
import { styles } from './styles/TrackingPreferencesScreen.styles';

export function TrackingPreferencesScreen() {
  const { t } = useTranslation('settings');
  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('tracking.screenTitle')} />

      <View style={styles.content}>
        <SettingsSection title={t('tracking.section')}>
          <SettingsToggleRow
            label={t('tracking.showFiber')}
            hint={t('tracking.showFiberHint')}
            value={settings?.showFiberOnHome ?? true}
            onValueChange={(v) => updateSettings.mutate({ showFiberOnHome: v })}
          />
          <SettingsToggleRow
            label={t('tracking.showCarbsAndFat')}
            hint={t('tracking.showCarbsAndFatHint')}
            value={settings?.showCarbsAndFatOnHome ?? true}
            onValueChange={(v) => updateSettings.mutate({ showCarbsAndFatOnHome: v })}
          />
          <SettingsToggleRow
            label={t('tracking.showProgress')}
            hint={t('tracking.showProgressHint')}
            value={settings?.showProgressPercentages ?? true}
            onValueChange={(v) => updateSettings.mutate({ showProgressPercentages: v })}
          />
          <SettingsToggleRow
            label={t('tracking.showWeeklyBalance')}
            hint={t('tracking.showWeeklyBalanceHint')}
            value={settings?.showWeeklyBalance ?? true}
            onValueChange={(v) => updateSettings.mutate({ showWeeklyBalance: v })}
          />
          <SettingsToggleRow
            label={t('tracking.showGuidedSuggestions')}
            hint={t('tracking.showGuidedSuggestionsHint')}
            value={settings?.showGuidedSuggestions ?? true}
            onValueChange={(v) => updateSettings.mutate({ showGuidedSuggestions: v })}
            last
          />
        </SettingsSection>
      </View>
    </SafeAreaView>
  );
}
