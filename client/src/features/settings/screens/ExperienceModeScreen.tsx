import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useNutritionSettings, useUpdateSettings } from '../hooks/useSettings';
import { ExperienceMode } from '../types';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/ExperienceModeScreen.styles';

type ModeCardProps = {
  mode: ExperienceMode;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  isRTL: boolean;
  onPress: () => void;
};

function ModeCard({ mode: _mode, title, description, icon, active, isRTL, onPress }: ModeCardProps) {
  const dir = getDirectionStyles(isRTL);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.cardHeader, dir.row]}>
        <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={active ? colors.cardBackground : colors.textSecondary}
          />
        </View>
        <Text style={[styles.cardTitle, active && styles.cardTitleActive, dir.text]}>{title}</Text>
        <View style={[styles.radio, active && styles.radioActive]}>
          {active ? (
            <MaterialCommunityIcons name="check" size={14} color={colors.cardBackground} />
          ) : null}
        </View>
      </View>
      <Text style={[styles.cardDescription, active && styles.cardDescriptionActive, dir.text]}>
        {description}
      </Text>
    </Pressable>
  );
}

export function ExperienceModeScreen() {
  const { t, i18n } = useTranslation('settings');
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const current = settings?.experienceMode ?? 'GUIDED';

  function handleSelect(mode: ExperienceMode) {
    if (mode === current) return;
    updateSettings.mutate({ experienceMode: mode });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader
        title={t('experience.screenTitle')}
        rightElement={
          updateSettings.isPending ? (
            <ActivityIndicator size="small" color={colors.primaryGreen} />
          ) : undefined
        }
      />

      <View style={styles.content}>
        <ModeCard
          mode="EXPERT"
          title={t('experience.expert')}
          description={t('experience.expertDescription')}
          icon="chart-timeline-variant"
          active={current === 'EXPERT'}
          isRTL={isRTL}
          onPress={() => handleSelect('EXPERT')}
        />
        <ModeCard
          mode="GUIDED"
          title={t('experience.guided')}
          description={t('experience.guidedDescription')}
          icon="lightbulb-outline"
          active={current === 'GUIDED'}
          isRTL={isRTL}
          onPress={() => handleSelect('GUIDED')}
        />
      </View>
    </SafeAreaView>
  );
}
