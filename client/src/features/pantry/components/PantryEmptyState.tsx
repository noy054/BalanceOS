import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PantryTab } from '../types';
import { colors } from '../../../shared/theme';
import { styles } from './styles/PantryEmptyState.styles';

const CONFIG: Record<
  PantryTab,
  { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; messageKey: string; hintKey: string }
> = {
  products: {
    icon: 'package-variant-closed',
    messageKey: 'empty.products',
    hintKey: 'empty.productsHint',
  },
  recipes: {
    icon: 'chef-hat',
    messageKey: 'empty.recipes',
    hintKey: 'empty.recipesHint',
  },
  savedMeals: {
    icon: 'bookmark-outline',
    messageKey: 'empty.savedMeals',
    hintKey: 'empty.savedMealsHint',
  },
};

type Props = {
  tab: PantryTab;
};

export function PantryEmptyState({ tab }: Props) {
  const { t } = useTranslation('pantry');
  const config = CONFIG[tab];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={config.icon}
        size={56}
        color={colors.primaryGreenMid}
        style={styles.icon}
      />
      <Text style={styles.message}>{t(config.messageKey)}</Text>
      <Text style={styles.hint}>{t(config.hintKey)}</Text>
    </View>
  );
}
