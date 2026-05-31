import { Pressable, Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius } from '../../../shared/theme';

type Props = {
  onPress?: () => void;
};

export function AddMealButton({ onPress }: Props) {
  const { t } = useTranslation('dashboard');

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="plus" size={22} color={colors.primaryGreen} />
      </View>
      <Text style={styles.label}>{t('actions.addMeal')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cardBackground,
    letterSpacing: 0.2,
  },
});
