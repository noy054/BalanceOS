import type { ComponentProps } from 'react';
import { Text, Pressable, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExperienceMode } from '../../src/features/nutrition-settings/types';
import { ScreenShell } from '../../src/shared/components/ScreenShell';
import { BrandMark } from '../../src/shared/components/BrandMark';
import { useAppTheme } from '../../src/shared/theme';
import { useStyles, getDirectionStyles } from './styles/mode.styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function OnboardingModeScreen() {
  const { t, i18n } = useTranslation('onboarding');
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  function handleSelect(mode: ExperienceMode) {
    if (mode === 'EXPERT') {
      router.push('/(onboarding)/expert-targets');
    } else {
      router.push('/(onboarding)/guided-intro');
    }
  }

  function renderCard(mode: ExperienceMode, icon: IconName, title: string, description: string) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, dir.row, pressed && styles.cardPressed]}
        onPress={() => handleSelect(mode)}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${description}`}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon} size={22} color={colors.accent} />
        </View>

        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, dir.text]}>{title}</Text>
          <Text style={[styles.cardDesc, dir.text]}>{description}</Text>
        </View>

        <MaterialCommunityIcons
          name={isRTL ? 'chevron-left' : 'chevron-right'}
          size={22}
          color={colors.textMuted}
        />
      </Pressable>
    );
  }

  return (
    <ScreenShell>
      <BrandMark style={[styles.brand, dir.alignStart]} />
      <Text style={[styles.title, dir.text]}>{t('mode.title')}</Text>
      <Text style={[styles.subtitle, dir.text]}>{t('mode.subtitle')}</Text>

      {renderCard('EXPERT', 'chart-timeline-variant', t('mode.expertTitle'), t('mode.expertDesc'))}
      {renderCard('GUIDED', 'lightbulb-outline', t('mode.guidedTitle'), t('mode.guidedDesc'))}
    </ScreenShell>
  );
}
