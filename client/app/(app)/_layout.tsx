import { StyleSheet, View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../../src/shared/theme';
import { BottomTabBar } from '../../src/shared/components/BottomTabBar';
import { NutritionDisplayProvider } from '../../src/features/settings/components/NutritionDisplayProvider';

type TabId = 'home' | 'pantry' | 'statistics' | 'settings';

const TAB_ROUTES: Record<string, TabId> = {
  '/dashboard': 'home',
  '/statistics': 'statistics',
  '/pantry': 'pantry',
  '/settings': 'settings',
};

export default function AppLayout() {
  const { colors } = useAppTheme();
  const pathname = usePathname();
  const activeTab = TAB_ROUTES[pathname] ?? null;
  const { i18n } = useTranslation();
  const slideAnimation = i18n.dir(i18n.language) === 'rtl' ? 'slide_from_left' : 'slide_from_right';

  return (
    <NutritionDisplayProvider>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.stack}>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              animation: slideAnimation,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            {/* Tab root screens — instant switch; gestures disabled because animation:'none'
                + gestureEnabled:true causes snapping/jumping on swipe. Swipe-back works
                normally on any screen pushed on top of a tab. */}
            <Stack.Screen name="dashboard" options={{ animation: 'none', gestureEnabled: false }} />
            <Stack.Screen name="statistics" options={{ animation: 'none', gestureEnabled: false }} />
            <Stack.Screen name="pantry" options={{ animation: 'none', gestureEnabled: false }} />
            <Stack.Screen name="settings" options={{ animation: 'none', gestureEnabled: false }} />
          </Stack>
        </View>

        {activeTab !== null && <BottomTabBar activeTab={activeTab} />}
      </View>
    </NutritionDisplayProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  stack: {
    flex: 1,
  },
});
