import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUpsertNutritionSettings } from '../../src/features/nutrition-settings/hooks/useNutritionSettings';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { ScreenShell } from '../../src/shared/components/ScreenShell';
import { getTextAlign, i18n } from '../../src/shared/i18n';
import type { SupportedLanguage } from '../../src/shared/i18n';

export default function ExpertTargetsScreen() {
  const { t } = useTranslation('onboarding');
  const textAlign = getTextAlign();

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');

  const upsert = useUpsertNutritionSettings();

  const caloriesNum = parseInt(calories, 10);
  const proteinNum = parseInt(protein, 10);
  const canSubmit =
    !upsert.isPending &&
    calories.length > 0 &&
    protein.length > 0 &&
    caloriesNum > 0 &&
    proteinNum > 0;

  function handleSave() {
    upsert.mutate(
      {
        experienceMode: 'EXPERT',
        targetMode: 'MANUAL',
        onboardingCompleted: true,
        preferredLanguage: i18n.language as SupportedLanguage,
        dailyCaloriesTarget: caloriesNum,
        proteinTarget: proteinNum,
        ...(carbs ? { carbsTarget: parseInt(carbs, 10) } : {}),
        ...(fat ? { fatTarget: parseInt(fat, 10) } : {}),
        ...(fiber ? { fiberTarget: parseInt(fiber, 10) } : {}),
      },
      { onSuccess: () => router.replace('/(app)/dashboard') },
    );
  }

  return (
    <ScreenShell>
      <Text style={[styles.title, { textAlign }]}>{t('targets.title')}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>{t('targets.subtitle')}</Text>

      <TextInput
        label={t('targets.caloriesLabel')}
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={upsert.isPending}
      />
      <TextInput
        label={t('targets.proteinLabel')}
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={upsert.isPending}
      />
      <TextInput
        label={t('targets.carbsLabel')}
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={upsert.isPending}
      />
      <TextInput
        label={t('targets.fatLabel')}
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={upsert.isPending}
      />
      <TextInput
        label={t('targets.fiberLabel')}
        value={fiber}
        onChangeText={setFiber}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        contentStyle={{ textAlign: textAlign }}
        disabled={upsert.isPending}
      />

      {upsert.error ? (
        <HelperText type="error" visible>
          {extractErrorMessage(upsert.error)}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={upsert.isPending}
        disabled={!canSubmit}
        style={styles.button}
      >
        {t('targets.saveButton')}
      </Button>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 24 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 6 },
});
