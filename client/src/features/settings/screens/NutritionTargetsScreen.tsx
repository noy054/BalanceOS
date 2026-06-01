import { useState } from 'react';
import { ScrollView, View, Text, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { FormInput } from '../../../shared/components/FormInput';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { useNutritionSettings, useUpdateSettings } from '../hooks/useSettings';
import { TargetMode } from '../types';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/NutritionTargetsScreen.styles';

function parseTarget(val: string): number | undefined {
  const n = parseInt(val, 10);
  return isNaN(n) || n <= 0 ? undefined : n;
}

export function NutritionTargetsScreen() {
  const { t, i18n } = useTranslation('settings');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const [targetMode, setTargetMode] = useState<TargetMode>(settings?.targetMode ?? 'AUTO');
  const [calories, setCalories] = useState(settings?.dailyCaloriesTarget?.toString() ?? '');
  const [protein, setProtein] = useState(settings?.proteinTarget?.toString() ?? '');
  const [carbs, setCarbs] = useState(settings?.carbsTarget?.toString() ?? '');
  const [fat, setFat] = useState(settings?.fatTarget?.toString() ?? '');
  const [fiber, setFiber] = useState(settings?.fiberTarget?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        targetMode,
        dailyCaloriesTarget: parseTarget(calories),
        proteinTarget: parseTarget(protein),
        carbsTarget: parseTarget(carbs),
        fatTarget: parseTarget(fat),
        fiberTarget: parseTarget(fiber),
      });
      router.back();
    } catch {
      Alert.alert('', t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('nutritionTargets.screenTitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mode selector */}
        <SettingsSection title={t('nutritionTargets.targetModeSection')}>
          <SettingsSelectRow
            label={t('nutritionTargets.targetModeSection')}
            value={targetMode}
            options={[
              { value: 'AUTO' as TargetMode, label: t('nutritionTargets.targetModeAuto') },
              { value: 'MANUAL' as TargetMode, label: t('nutritionTargets.targetModeManual') },
            ]}
            onChange={setTargetMode}
            last
          />
        </SettingsSection>

        {targetMode === 'AUTO' ? (
          <View style={styles.autoNote}>
            <Text style={[{ fontSize: 13, color: colors.primaryGreen, lineHeight: 20 }, dir.text]}>
              {t('nutritionTargets.targetModeAutoHint')}
            </Text>
          </View>
        ) : (
          <SettingsSection title={t('nutritionTargets.targetsSection')}>
            <View style={styles.formCard}>
              <FormInput
                label={t('nutritionTargets.caloriesLabel')}
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
              />
              <FormInput
                label={t('nutritionTargets.proteinLabel')}
                value={protein}
                onChangeText={setProtein}
                keyboardType="number-pad"
              />
              <FormInput
                label={t('nutritionTargets.carbsLabel')}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="number-pad"
              />
              <FormInput
                label={t('nutritionTargets.fatLabel')}
                value={fat}
                onChangeText={setFat}
                keyboardType="number-pad"
              />
              <FormInput
                label={t('nutritionTargets.fiberLabel')}
                value={fiber}
                onChangeText={setFiber}
                keyboardType="number-pad"
              />
            </View>
          </SettingsSection>
        )}

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? t('nutritionTargets.saving') : t('nutritionTargets.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
