import { Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExperienceMode } from '../../src/features/nutrition-settings/types';
import { styles, getDirectionStyles } from './styles/mode.styles';

export default function OnboardingModeScreen() {
  const { t, i18n } = useTranslation('onboarding');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  function handleSelect(mode: ExperienceMode) {
    if (mode === 'EXPERT') {
      router.push('/(onboarding)/expert-targets');
    } else {
      router.push('/(onboarding)/guided-intro');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, dir.text]}>{t('mode.title')}</Text>
      <Text style={[styles.subtitle, dir.text]}>{t('mode.subtitle')}</Text>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleSelect('EXPERT')}
      >
        <Text style={[styles.cardTitle, dir.text]}>{t('mode.expertTitle')}</Text>
        <Text style={[styles.cardDesc, dir.text]}>{t('mode.expertDesc')}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleSelect('GUIDED')}
      >
        <Text style={[styles.cardTitle, dir.text]}>{t('mode.guidedTitle')}</Text>
        <Text style={[styles.cardDesc, dir.text]}>{t('mode.guidedDesc')}</Text>
      </Pressable>
    </View>
  );
}
