import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useNutritionSettings, useUpdateSettings } from '../hooks/useSettings';
import { ExperienceMode } from '../types';
import { useAppTheme } from '../../../shared/theme';
import { useStyles, getDirectionStyles } from './styles/ExperienceModeScreen.styles';

type ModeCardProps = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  isRTL: boolean;
  onPress: () => void;
};

function ModeCard({ title, description, icon, active, isRTL, onPress }: ModeCardProps) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={[styles.cardHeader, dir.row]}>
        <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={active ? colors.accent : colors.textSecondary}
          />
        </View>

        <Text style={[styles.cardTitle, dir.text]}>{title}</Text>

        <View style={[styles.radio, active && styles.radioActive]}>
          {active ? <View style={styles.radioDot} /> : null}
        </View>
      </View>

      <Text style={[styles.cardDescription, dir.text]}>{description}</Text>
    </Pressable>
  );
}

export function ExperienceModeScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors } = useAppTheme();
  const styles = useStyles();
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
            <ActivityIndicator size="small" color={colors.accent} />
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ModeCard
          title={t('experience.expert')}
          description={t('experience.expertDescription')}
          icon="chart-timeline-variant"
          active={current === 'EXPERT'}
          isRTL={isRTL}
          onPress={() => handleSelect('EXPERT')}
        />
        <ModeCard
          title={t('experience.guided')}
          description={t('experience.guidedDescription')}
          icon="lightbulb-outline"
          active={current === 'GUIDED'}
          isRTL={isRTL}
          onPress={() => handleSelect('GUIDED')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
