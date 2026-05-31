import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../shared/theme';

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBalance: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  logoOS: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryGreen,
    letterSpacing: -0.3,
  },
  logoLeaf: {
    marginStart: 4,
    marginTop: 1,
  },
  settingsButton: {
    padding: spacing.xs,
  },
});
