import { StyleSheet, Text, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUpsertNutritionSettings } from '../../src/features/nutrition-settings/hooks/useNutritionSettings';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { getTextAlign, i18n } from '../../src/shared/i18n';
import type { SupportedLanguage } from '../../src/shared/i18n';

export default function GuidedIntroScreen() {
  const { t } = useTranslation('onboarding');
  const textAlign = getTextAlign();

  const upsert = useUpsertNutritionSettings();

  function handleContinue() {
    upsert.mutate(
      { experienceMode: 'GUIDED', targetMode: 'AUTO', onboardingCompleted: true, preferredLanguage: i18n.language as SupportedLanguage },
      { onSuccess: () => router.replace('/(app)/dashboard') },
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{t('guided.title')}</Text>
      <Text style={[styles.body, { textAlign }]}>{t('guided.body1')}</Text>
      <Text style={[styles.body, { textAlign }]}>{t('guided.body2')}</Text>

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
        style={styles.button}
      >
        {t('guided.startButton')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 16 },
  body: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 16 },
  button: { marginTop: 8, borderRadius: 6 },
});
