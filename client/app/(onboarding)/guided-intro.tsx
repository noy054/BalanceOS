import { Text } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUpsertNutritionSettings } from '../../src/features/nutrition-settings/hooks/useNutritionSettings';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { ScreenShell } from '../../src/shared/components/ScreenShell';
import { BrandMark } from '../../src/shared/components/BrandMark';
import { i18n } from '../../src/shared/i18n';
import type { SupportedLanguage } from '../../src/shared/i18n';
import { useAppTheme } from '../../src/shared/theme';
import { useStyles, getDirectionStyles } from './styles/guided-intro.styles';

export default function GuidedIntroScreen() {
  const { t, i18n: i18nHook } = useTranslation('onboarding');
  const { colors } = useAppTheme();
  const styles = useStyles();
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
    <ScreenShell>
      <BrandMark style={[styles.brand, dir.alignStart]} />
      <Text style={[styles.title, dir.text]}>{t('guided.title')}</Text>
      <Text style={[styles.body, dir.text]}>{t('guided.body1')}</Text>
      <Text style={[styles.body, dir.text]}>{t('guided.body2')}</Text>

      {upsert.error ? (
        <HelperText type="error" visible style={dir.text}>
          {extractErrorMessage(upsert.error)}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleContinue}
        loading={upsert.isPending}
        disabled={upsert.isPending}
        buttonColor={colors.accent}
        textColor={colors.onAccent}
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
        style={styles.button}
      >
        {t('guided.startButton')}
      </Button>
    </ScreenShell>
  );
}
