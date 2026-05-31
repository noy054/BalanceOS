import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../../shared/theme';

type Props = {
  onBackPress?: () => void;
};

export function PantryHeader({ onBackPress }: Props) {
  const { t } = useTranslation('pantry');

  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  backButton: {
    padding: spacing.xs,
    marginTop: 2,
  },
});
