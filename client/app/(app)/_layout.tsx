import { I18nManager, Platform, StyleSheet, View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, spacing } from '../../src/shared/theme';
import { BottomTabBar } from '../../src/shared/components/BottomTabBar';

// Computed once at module load. I18nManager.isRTL is set during the startup
// effect in the root layout and never changes within a session — language
// switches trigger a full reload via Updates.reloadAsync().
const slideAnimation = I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right';

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
  const insets = useSafeAreaInsets();
  const activeTab = TAB_ROUTES[pathname] ?? null;

  // On Android, move the wrapper above the system gesture/nav bar instead of
  // relying on the inner paddingBottom — avoids double-stacking the inset.
  const wrapperBottom =
    Platform.OS === 'ios' ? spacing.lg : insets.bottom + spacing.md;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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

      {activeTab !== null && (
        <View style={[styles.tabBarWrapper, { bottom: wrapperBottom }]}>
          <BottomTabBar activeTab={activeTab} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  tabBarWrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 50,
    borderRadius: 34,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.56,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 16 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
