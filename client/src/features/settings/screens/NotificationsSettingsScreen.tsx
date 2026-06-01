import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsToggleRow } from '../components/SettingsToggleRow';
import { useNutritionSettings, useUpdateSettings } from '../hooks/useSettings';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/NotificationsSettingsScreen.styles';

// TODO: Schedule actual OS notifications after installing expo-notifications:
// npx expo install expo-notifications
// Then call Notifications.scheduleNotificationAsync() on toggle/time change.

type ReminderRowProps = {
  label: string;
  enabled: boolean;
  time: string;
  onToggle: (v: boolean) => void;
  onTimeChange: (v: string) => void;
  timePlaceholder: string;
  isRTL: boolean;
  last?: boolean;
};

function ReminderRow({ label, enabled, time, onToggle, onTimeChange, timePlaceholder, isRTL, last = false }: ReminderRowProps) {
  return (
    <View style={[styles.reminderRow, !last && styles.reminderRowBorder]}>
      <SettingsToggleRow
        label={label}
        value={enabled}
        onValueChange={onToggle}
        last
      />
      {enabled ? (
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.timeInput, { textAlign: isRTL ? 'right' : 'left' }]}
            value={time}
            onChangeText={onTimeChange}
            placeholder={timePlaceholder}
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      ) : null}
    </View>
  );
}

export function NotificationsSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const [breakfast, setBreakfast] = useState(settings?.breakfastReminderEnabled ?? false);
  const [breakfastTime, setBreakfastTime] = useState(settings?.breakfastReminderTime ?? '');
  const [lunch, setLunch] = useState(settings?.lunchReminderEnabled ?? false);
  const [lunchTime, setLunchTime] = useState(settings?.lunchReminderTime ?? '');
  const [dinner, setDinner] = useState(settings?.dinnerReminderEnabled ?? false);
  const [dinnerTime, setDinnerTime] = useState(settings?.dinnerReminderTime ?? '');
  const [water, setWater] = useState(settings?.waterReminderEnabled ?? false);
  const [waterInterval, setWaterInterval] = useState(settings?.waterReminderInterval?.toString() ?? '');
  const [daily, setDaily] = useState(settings?.dailySummaryEnabled ?? false);
  const [dailyTime, setDailyTime] = useState(settings?.dailySummaryTime ?? '');
  const [weekly, setWeekly] = useState(settings?.weeklySummaryEnabled ?? false);
  const [weeklyDay, setWeeklyDay] = useState(settings?.weeklySummaryDay?.toString() ?? '0');
  const [weeklyTime, setWeeklyTime] = useState(settings?.weeklySummaryTime ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        breakfastReminderEnabled: breakfast,
        breakfastReminderTime: breakfast && breakfastTime ? breakfastTime : undefined,
        lunchReminderEnabled: lunch,
        lunchReminderTime: lunch && lunchTime ? lunchTime : undefined,
        dinnerReminderEnabled: dinner,
        dinnerReminderTime: dinner && dinnerTime ? dinnerTime : undefined,
        waterReminderEnabled: water,
        waterReminderInterval: water && waterInterval ? parseInt(waterInterval, 10) : undefined,
        dailySummaryEnabled: daily,
        dailySummaryTime: daily && dailyTime ? dailyTime : undefined,
        weeklySummaryEnabled: weekly,
        weeklySummaryDay: weekly ? parseInt(weeklyDay, 10) : undefined,
        weeklySummaryTime: weekly && weeklyTime ? weeklyTime : undefined,
      });
      router.back();
    } catch {
      Alert.alert('', t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  const timePh = t('notifications.timePlaceholder');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('notifications.screenTitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.comingSoonBanner}>
          <Text style={[styles.comingSoonText, dir.text]}>{t('notifications.comingSoon')}</Text>
        </View>

        <SettingsSection title={t('sections.notifications')}>
          <ReminderRow
            label={t('notifications.breakfastReminder')}
            enabled={breakfast}
            time={breakfastTime}
            onToggle={setBreakfast}
            onTimeChange={setBreakfastTime}
            timePlaceholder={timePh}
            isRTL={isRTL}
          />
          <ReminderRow
            label={t('notifications.lunchReminder')}
            enabled={lunch}
            time={lunchTime}
            onToggle={setLunch}
            onTimeChange={setLunchTime}
            timePlaceholder={timePh}
            isRTL={isRTL}
          />
          <ReminderRow
            label={t('notifications.dinnerReminder')}
            enabled={dinner}
            time={dinnerTime}
            onToggle={setDinner}
            onTimeChange={setDinnerTime}
            timePlaceholder={timePh}
            isRTL={isRTL}
            last
          />
        </SettingsSection>

        <SettingsSection title={t('notifications.waterReminder')}>
          <SettingsToggleRow
            label={t('notifications.waterReminder')}
            value={water}
            onValueChange={setWater}
            last
          />
          {water ? (
            <View style={[styles.intervalRow, dir.row]}>
              <Text style={[styles.intervalLabel, dir.text]}>{t('notifications.waterIntervalLabel')}</Text>
              <TextInput
                style={styles.intervalInput}
                value={waterInterval}
                onChangeText={setWaterInterval}
                keyboardType="number-pad"
                placeholder="60"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ) : null}
        </SettingsSection>

        <SettingsSection title={t('notifications.dailySummary')}>
          <ReminderRow
            label={t('notifications.dailySummary')}
            enabled={daily}
            time={dailyTime}
            onToggle={setDaily}
            onTimeChange={setDailyTime}
            timePlaceholder={timePh}
            isRTL={isRTL}
            last
          />
        </SettingsSection>

        <SettingsSection title={t('notifications.weeklySummary')}>
          <SettingsToggleRow
            label={t('notifications.weeklySummary')}
            value={weekly}
            onValueChange={setWeekly}
          />
          {weekly ? (
            <View style={styles.weeklyOptions}>
              <View style={[styles.dayChips, dir.row]}>
                {(['0','1','2','3','4','5','6'] as const).map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.dayChip, weeklyDay === d && styles.dayChipActive]}
                    onPress={() => setWeeklyDay(d)}
                  >
                    <Text style={[styles.dayChipText, weeklyDay === d && styles.dayChipTextActive]}>
                      {t(`notifications.days.${d}` as Parameters<typeof t>[0]).slice(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.timeRow}>
                <TextInput
                  style={styles.timeInput}
                  value={weeklyTime}
                  onChangeText={setWeeklyTime}
                  placeholder={timePh}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>
          ) : null}
        </SettingsSection>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? t('notifications.saving') : t('notifications.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
