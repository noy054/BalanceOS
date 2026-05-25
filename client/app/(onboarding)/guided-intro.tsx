import { StyleSheet, Text, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useUpsertNutritionSettings } from '../../src/features/nutrition-settings/hooks/useNutritionSettings';
import { extractErrorMessage } from '../../src/shared/helpers/extractErrorMessage';

export default function GuidedIntroScreen() {
  const upsert = useUpsertNutritionSettings();

  function handleContinue() {
    upsert.mutate(
      { experienceMode: 'GUIDED', targetMode: 'AUTO', onboardingCompleted: true },
      { onSuccess: () => router.replace('/(app)/dashboard') },
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>We'll help you get set up</Text>
      <Text style={styles.body}>
        BalanceOS will guide you through choosing calorie and macro targets based
        on your goals. You can adjust everything manually at any time.
      </Text>
      <Text style={styles.body}>
        Guided target setup is coming soon. For now, we'll apply sensible
        defaults and you can update them from settings.
      </Text>

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
        Get started
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
