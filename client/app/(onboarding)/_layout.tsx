import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function OnboardingLayout() {
  const { i18n } = useTranslation();
  const slideAnimation = i18n.dir(i18n.language) === 'rtl' ? 'slide_from_left' : 'slide_from_right';

  return <Stack screenOptions={{ headerShown: false, animation: slideAnimation }} />;
}
