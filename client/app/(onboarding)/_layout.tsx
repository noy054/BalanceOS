import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';

const slideAnimation = I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: slideAnimation }} />;
}
