import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ExperienceMode } from '../../src/features/nutrition-settings/types';

export default function OnboardingModeScreen() {
  function handleSelect(mode: ExperienceMode) {
    if (mode === 'EXPERT') {
      router.push('/(onboarding)/expert-targets');
    } else {
      router.push('/(onboarding)/guided-intro');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How do you want to use BalanceOS?</Text>
      <Text style={styles.subtitle}>You can change this later in settings.</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect('EXPERT')}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>I know what I'm doing</Text>
        <Text style={styles.cardDesc}>
          Set your own calorie and macro targets. Full control, no hand-holding.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect('GUIDED')}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>Guide me</Text>
        <Text style={styles.cardDesc}>
          We'll help you choose targets that fit your goals.
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 32,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
