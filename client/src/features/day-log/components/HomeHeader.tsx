import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../../../shared/theme';
import { styles } from './styles/HomeHeader.styles';

type Props = {
  onSettingsPress?: () => void;
};

export function HomeHeader({ onSettingsPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Text style={styles.logoBalance}>Balance</Text>
        <Text style={styles.logoOS}>OS</Text>
        <MaterialCommunityIcons
          name="leaf"
          size={18}
          color={colors.primaryGreen}
          style={styles.logoLeaf}
        />
      </View>
      <Pressable onPress={onSettingsPress} style={styles.settingsButton} hitSlop={12}>
        <MaterialCommunityIcons name="cog-outline" size={26} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}
