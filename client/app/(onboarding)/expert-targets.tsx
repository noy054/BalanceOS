import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useUpsertNutritionSettings } from '../../src/features/nutrition-settings/hooks/useNutritionSettings';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';
import { ScreenShell } from '../../src/shared/components/ScreenShell';

export default function ExpertTargetsScreen() {
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
      <Text style={styles.title}>Set your daily targets</Text>
      <Text style={styles.subtitle}>Calories and protein are required.</Text>

      <TextInput
        label="Daily calories (kcal) *"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        disabled={upsert.isPending}
      />
      <TextInput
        label="Protein (g) *"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        disabled={upsert.isPending}
      />
      <TextInput
        label="Carbs (g)"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        disabled={upsert.isPending}
      />
      <TextInput
        label="Fat (g)"
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        disabled={upsert.isPending}
      />
      <TextInput
        label="Fiber (g)"
        value={fiber}
        onChangeText={setFiber}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
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
        Save and continue
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
