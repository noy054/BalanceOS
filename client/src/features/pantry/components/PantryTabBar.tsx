import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PantryTab } from '../types';
import { styles, getDirectionStyles } from './styles/PantryTabBar.styles';

const TABS: PantryTab[] = ['products', 'recipes', 'savedMeals'];

type Props = {
  activeTab: PantryTab;
  onTabPress: (tab: PantryTab) => void;
};

export function PantryTabBar({ activeTab, onTabPress }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.container, dir.row]}>
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
