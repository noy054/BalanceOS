import { Text, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUpsertNutritionSettings } from '../../src/features/nutrition-settings/hooks/useNutritionSettings';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { i18n } from '../../src/shared/i18n';
import type { SupportedLanguage } from '../../src/shared/i18n';
import { colors } from '../../src/shared/theme';
import { styles, getDirectionStyles } from './styles/guided-intro.styles';

export default function GuidedIntroScreen() {
  const { t, i18n: i18nHook } = useTranslation('onboarding');
  const isRTL = i18nHook.dir(i18nHook.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);
  const upsert = useUpsertNutritionSettings();

  function handleContinue() {
    upsert.mutate(
      { experienceMode: 'GUIDED', targetMode: 'AUTO', onboardingCompleted: true, preferredLanguage: i18n.language as SupportedLanguage },
      { onSuccess: () => router.replace('/(app)/dashboard') },
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, dir.text]}>{t('guided.title')}</Text>
      <Text style={[styles.body, dir.text]}>{t('guided.body1')}</Text>
      <Text style={[styles.body, dir.text]}>{t('guided.body2')}</Text>

      {upsert.error ? (
        <HelperText type="error" visible>
          {extractErrorMessage(upsert.error)}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleContinue}
        loading={upsert.isPending}
        disabled={upsert.isPending}
        buttonColor={colors.primaryGreen}
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.button}
      >
        {t('guided.startButton')}
      </Button>
    </View>
  );
}
