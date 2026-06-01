import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../shared/theme';
import { styles } from './styles/CalorieSummaryCard.styles';

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
