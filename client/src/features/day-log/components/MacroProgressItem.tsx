import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { MacroItem } from '../types';
import { MACRO_CONFIG } from '../constants/macros';
import { colors } from '../../../shared/theme';
import { styles } from './styles/MacroProgressItem.styles';

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
