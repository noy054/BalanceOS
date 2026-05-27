import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/features/auth/hooks/useAuthStore';
import { saveLanguage } from '../src/shared/i18n';
import type { SupportedLanguage } from '../src/shared/i18n';

export default function LanguageScreen() {
  const setLanguageReady = useAuthStore((s) => s.setLanguageReady);

  async function handleSelect(lang: SupportedLanguage) {
    await saveLanguage(lang);
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      setLanguageReady(true);
      router.replace('/(auth)/login');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>בחר שפה{'\n'}Choose your language</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect('he')}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>עברית</Text>
        <Text style={styles.cardSub}>Hebrew · RTL</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>מומלץ · Recommended</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect('en')}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>English</Text>
        <Text style={styles.cardSub}>אנגלית · LTR</Text>
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
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
});
