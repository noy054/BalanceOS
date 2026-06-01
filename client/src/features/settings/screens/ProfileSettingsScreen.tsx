import { useState } from 'react';
import { ScrollView, View, Text, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { FormInput } from '../../../shared/components/FormInput';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { useNutritionSettings, useUpdateSettings, useUpdateProfile } from '../hooks/useSettings';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { Gender, GoalType } from '../types';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/ProfileSettingsScreen.styles';

export function ProfileSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const user = useAuthStore((s) => s.user);
  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [heightCm, setHeightCm] = useState(settings?.heightCm?.toString() ?? '');
  const [weightKg, setWeightKg] = useState(settings?.weightKg?.toString() ?? '');
  const [trainingDays, setTrainingDays] = useState(settings?.trainingDaysPerWeek?.toString() ?? '');
  const [birthDate, setBirthDate] = useState(settings?.birthDate?.slice(0, 10) ?? '');
  const [gender, setGender] = useState<Gender | ''>(settings?.gender ?? '');
  const [goalType, setGoalType] = useState<GoalType | ''>(settings?.goalType ?? '');
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!fullName.trim()) {
      setNameError(t('errors.saveFailed'));
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all([
        updateProfile.mutateAsync({ fullName: fullName.trim() }),
        updateSettings.mutateAsync({
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          trainingDaysPerWeek: trainingDays ? parseInt(trainingDays, 10) : undefined,
          birthDate: birthDate || undefined,
          gender: (gender as Gender) || undefined,
          goalType: (goalType as GoalType) || undefined,
        }),
      ]);
      router.back();
    } catch {
      Alert.alert('', t('errors.profileSaveFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('profile.screenTitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <SettingsSection title={t('sections.profile')}>
          <View style={styles.formCard}>
            <FormInput
              label={t('profile.fullNameLabel')}
              value={fullName}
              onChangeText={(v) => { setFullName(v); setNameError(''); }}
              error={nameError}
              autoFocus
            />
            <View style={styles.readonlyGroup}>
              <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }, dir.text]}>
                {t('profile.emailLabel')}
              </Text>
              <Text style={[{ fontSize: 15, color: colors.textPrimary }, dir.text]}>
                {user?.email ?? ''}
              </Text>
              <Text style={[{ fontSize: 12, color: colors.textMuted, marginTop: 2 }, dir.text]}>
                {t('profile.emailNote')}
              </Text>
            </View>
          </View>
        </SettingsSection>

        {/* Physique & goal */}
        <SettingsSection title={t('sections.preferences')}>
          <SettingsSelectRow
            label={t('profile.genderLabel')}
            value={gender as Gender}
            options={[
              { value: 'MALE' as Gender, label: t('profile.genderMale') },
              { value: 'FEMALE' as Gender, label: t('profile.genderFemale') },
              { value: 'OTHER' as Gender, label: t('profile.genderOther') },
            ]}
            onChange={setGender}
          />
          <SettingsSelectRow
            label={t('profile.goalLabel')}
            value={goalType as GoalType}
            options={[
              { value: 'CUTTING' as GoalType, label: t('profile.goalCutting') },
              { value: 'MAINTENANCE' as GoalType, label: t('profile.goalMaintenance') },
              { value: 'BULKING' as GoalType, label: t('profile.goalBulking') },
            ]}
            onChange={setGoalType}
            last
          />
        </SettingsSection>

        {/* Measurements */}
        <SettingsSection title={t('profile.trainingDaysLabel')}>
          <View style={styles.formCard}>
            <FormInput
              label={t('profile.birthDateLabel')}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder={t('profile.birthDatePlaceholder')}
            />
            <FormInput
              label={t('profile.heightLabel')}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
            />
            <FormInput
              label={t('profile.weightLabel')}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
            />
            <FormInput
              label={t('profile.trainingDaysLabel')}
              value={trainingDays}
              onChangeText={setTrainingDays}
              keyboardType="number-pad"
            />
          </View>
        </SettingsSection>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? t('profile.saving') : t('profile.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
