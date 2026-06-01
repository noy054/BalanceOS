import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { colors } from '../theme';
import { styles } from './styles/ScreenHeader.styles';

type Props = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export function ScreenHeader({ title, onBack, rightElement }: Props) {
  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
        <MaterialCommunityIcons name="chevron-right" size={26} color={colors.textPrimary} />
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
