import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth/hooks/useAuthStore';
import { useHydrateAuth } from '../src/features/auth/hooks/useAuth';
import { useNutritionSettings } from '../src/features/nutrition-settings/hooks/useNutritionSettings';

export default function Index() {
  useHydrateAuth();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isLanguageReady = useAuthStore((s) => s.isLanguageReady);
  const hasSelectedLanguage = useAuthStore((s) => s.hasSelectedLanguage);
  const { data: settings, isLoading } = useNutritionSettings();

  if (isHydrating || !isLanguageReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasSelectedLanguage) return <Redirect href="/language" />;

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!settings?.onboardingCompleted) {
    return <Redirect href="/(onboarding)/mode" />;
  }

  return <Redirect href="/(app)/dashboard" />;
}
