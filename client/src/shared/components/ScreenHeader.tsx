import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { colors } from '../theme';
import { styles } from './styles/ScreenHeader.styles';

type Props = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export function ScreenHeader({ title, onBack, rightElement }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Pressable onPress={handleBack} hitSlop={14} style={styles.backBtn}>
        <MaterialCommunityIcons
          name={isRTL ? 'chevron-right' : 'chevron-left'}
          size={28}
          color={colors.textPrimary}
        />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {rightElement ?? null}
      </View>
    </View>
  );
}
