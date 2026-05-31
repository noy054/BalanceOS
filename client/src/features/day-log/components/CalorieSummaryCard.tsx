import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, cardShadow } from '../../../shared/theme';

type Props = {
  eaten: number;
  target: number;
};

export function CalorieSummaryCard({ eaten, target }: Props) {
  const { t } = useTranslation('dashboard');
  const remaining = Math.max(target - eaten, 0);
  const progress = Math.min(eaten / target, 1);
  const dotPosition = Math.min(progress * 100, 97);

  return (
    <View style={styles.card}>
      <MaterialCommunityIcons
        name="leaf"
        size={40}
        color={colors.primaryGreen}
        style={styles.decorLeaf}
      />
      <Text style={styles.label}>{t('calories.remaining')}</Text>
      <Text style={styles.remainingNumber}>{remaining}</Text>
      <Text style={styles.summary}>
        {t('calories.summary', { eaten, target })}
      </Text>
      <View style={styles.progressWrapper}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={[styles.progressDot, { left: `${dotPosition}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryGreenLight,
    borderRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    marginHorizontal: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
    ...cardShadow,
  },
  decorLeaf: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    opacity: 0.25,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  remainingNumber: {
    fontSize: 80,
    fontWeight: '800',
    color: colors.primaryGreen,
    lineHeight: 88,
    textAlign: 'center',
    letterSpacing: -2,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  progressWrapper: {
    width: '100%',
    height: 16,
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: colors.progressTrack,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: 5,
  },
  progressDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryGreen,
    borderWidth: 2.5,
    borderColor: colors.primaryGreenLight,
    transform: [{ translateX: -8 }],
  },
});
