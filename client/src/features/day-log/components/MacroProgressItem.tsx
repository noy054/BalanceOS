import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { MacroItem } from '../types';
import { MACRO_CONFIG } from '../constants/macros';
import { colors, spacing } from '../../../shared/theme';

type Props = {
  macro: MacroItem;
};

export function MacroProgressItem({ macro }: Props) {
  const { t } = useTranslation('dashboard');
  const config = MACRO_CONFIG[macro.key];
  const progress = Math.min(macro.current / macro.target, 1);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={config.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={22}
        color={colors.primaryGreen}
        style={styles.icon}
      />
      <Text style={styles.label}>{t(`macros.${config.labelKey}`)}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.current}>{macro.current}</Text>
        <Text style={styles.separator}> / </Text>
        <Text style={styles.targetValue}>{macro.target}</Text>
      </View>
      <Text style={styles.unit}>{t('macros.gramsUnit')}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  separator: {
    fontSize: 13,
    color: colors.textMuted,
  },
  targetValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  unit: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: colors.progressTrack,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: 3,
  },
});
