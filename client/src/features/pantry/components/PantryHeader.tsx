import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/PantryHeader.styles';

type Props = {
  onBackPress?: () => void;
};

export function PantryHeader({ onBackPress }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.container, dir.row]}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.subtitle}>{t('subtitle')}</Text>
      </View>
      {onBackPress && (
        <Pressable onPress={onBackPress} style={styles.backButton} hitSlop={12}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={colors.textPrimary}
          />
        </Pressable>
      )}
    </View>
  );
}
