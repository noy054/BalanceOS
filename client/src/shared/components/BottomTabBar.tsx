import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { colors, spacing } from '../theme';

type TabId = 'home' | 'pantry' | 'add' | 'statistics' | 'profile';

type TabItem = {
  id: TabId;
  labelKey: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  activeIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route?: string;
};

const TABS: TabItem[] = [
  { id: 'home',       labelKey: 'home',       icon: 'home-outline',         activeIcon: 'home',              route: '/(app)/dashboard' },
  { id: 'pantry',     labelKey: 'pantry',     icon: 'package-variant-closed', activeIcon: 'package-variant', route: '/(app)/pantry' },
  { id: 'add',        labelKey: 'add',        icon: 'plus',                 activeIcon: 'plus' },
  { id: 'statistics', labelKey: 'statistics', icon: 'chart-bar-stacked',    activeIcon: 'chart-bar-stacked' },
  { id: 'profile',    labelKey: 'profile',    icon: 'account-outline',      activeIcon: 'account' },
];

type Props = {
  activeTab?: TabId;
  onTabPress?: (tab: TabId) => void;
};

export function BottomTabBar({ activeTab = 'home', onTabPress }: Props) {
  const { t } = useTranslation('dashboard');
  const insets = useSafeAreaInsets();

  function handlePress(tab: TabItem) {
    onTabPress?.(tab.id);
    if (tab.route) {
      router.push(tab.route as Parameters<typeof router.push>[0]);
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const isAdd = tab.id === 'add';

        if (isAdd) {
          return (
            <Pressable
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handlePress(tab)}
            >
              <View style={styles.addCircle}>
                <MaterialCommunityIcons name="plus" size={26} color={colors.cardBackground} />
              </View>
              <Text style={styles.tabLabel}>{t(`nav.${tab.labelKey}`)}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.id}
            style={styles.tabItem}
            onPress={() => handlePress(tab)}
          >
            <MaterialCommunityIcons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? colors.primaryGreen : colors.textMuted}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {t(`nav.${tab.labelKey}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  addCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.lg,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
