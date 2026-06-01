import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsRow } from '../components/SettingsRow';
import { styles, getDirectionStyles } from './styles/AboutScreen.styles';

export function AboutScreen() {
  const { t, i18n } = useTranslation('settings');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('about.screenTitle')} />

      <View style={styles.content}>
        {/* App identity card */}
        <View style={styles.appCard}>
          <View style={[styles.logoMark, dir.logoRow]}>
            <Text style={styles.logoBalance}>Balance</Text>
            <Text style={styles.logoOS}>OS</Text>
          </View>
          <Text style={styles.versionBadge}>
            {t('about.versionLabel')} {t('about.versionValue')}
          </Text>
        </View>

        <SettingsSection title={t('sections.app')}>
          <SettingsRow
            label={t('about.terms')}
            onPress={() => {}}
          />
          <SettingsRow
            label={t('about.privacy')}
            onPress={() => {}}
          />
          <SettingsRow
            label={t('about.contact')}
            onPress={() => {}}
            last
          />
        </SettingsSection>
      </View>
    </SafeAreaView>
  );
}
