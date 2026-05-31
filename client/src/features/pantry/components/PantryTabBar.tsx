import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PantryTab } from '../types';
import { colors, spacing } from '../../../shared/theme';

const TABS: PantryTab[] = ['products', 'recipes', 'savedMeals'];

type Props = {
  activeTab: PantryTab;
  onTabPress: (tab: PantryTab) => void;
};

export function PantryTabBar({ activeTab, onTabPress }: Props) {
  const { t } = useTranslation('pantry');

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabPress(tab)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {t(`tabs.${tab}`)}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  tabActive: {},
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primaryGreen,
  },
});
