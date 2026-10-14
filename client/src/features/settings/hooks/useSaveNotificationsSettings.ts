import { Alert } from "react-native";
import { router } from "expo-router";
import { TFunction } from "i18next";

import { useUpdateSettings } from "./useSettings";
import { useNotificationsSettingsForm } from "./useNotificationsSettingsForm";
import { scheduleSettingsNotifications } from "../helpers/notificationsScheduler";

type NotificationsForm = ReturnType<typeof useNotificationsSettingsForm>;

export function useSaveNotificationsSettings(
  form: NotificationsForm,
  t: TFunction<"settings">,
) {
  const updateSettings = useUpdateSettings();

  async function save() {
    const waterIntervalValue = form.waterInterval
      ? parseInt(form.waterInterval, 10)
      : undefined;

    const weeklyDayValue = form.weekly
      ? parseInt(form.weeklyDay, 10)
      : undefined;

    await updateSettings.mutateAsync({
      breakfastReminderEnabled: form.breakfast,
      breakfastReminderTime:
        form.breakfast && form.breakfastTime ? form.breakfastTime : undefined,

      lunchReminderEnabled: form.lunch,
      lunchReminderTime:
        form.lunch && form.lunchTime ? form.lunchTime : undefined,

      dinnerReminderEnabled: form.dinner,
      dinnerReminderTime:
        form.dinner && form.dinnerTime ? form.dinnerTime : undefined,

      waterReminderEnabled: form.water,
      waterReminderInterval:
        form.water && waterIntervalValue ? waterIntervalValue : undefined,

      dailySummaryEnabled: form.daily,
      dailySummaryTime:
        form.daily && form.dailyTime ? form.dailyTime : undefined,

      weeklySummaryEnabled: form.weekly,
      weeklySummaryDay: weeklyDayValue,
      weeklySummaryTime:
        form.weekly && form.weeklyTime ? form.weeklyTime : undefined,
    });

    await scheduleSettingsNotifications({
      breakfast: {
        enabled: form.breakfast,
        time: form.breakfastTime,
        title: t("notifications.breakfastReminder"),
        body: t("notifications.breakfastReminder"),
      },
      lunch: {
        enabled: form.lunch,
        time: form.lunchTime,
        title: t("notifications.lunchReminder"),
        body: t("notifications.lunchReminder"),
      },
      dinner: {
        enabled: form.dinner,
        time: form.dinnerTime,
        title: t("notifications.dinnerReminder"),
        body: t("notifications.dinnerReminder"),
      },
      dailySummary: {
        enabled: form.daily,
        time: form.dailyTime,
        title: t("notifications.dailySummary"),
        body: t("notifications.dailySummary"),
      },
      weeklySummary: {
        enabled: form.weekly,
        day: weeklyDayValue,
        time: form.weeklyTime,
        title: t("notifications.weeklySummary"),
        body: t("notifications.weeklySummary"),
      },
      water: {
        enabled: form.water,
        intervalMinutes: waterIntervalValue,
        title: t("notifications.waterReminder"),
        body: t("notifications.waterReminder"),
      },
    });

    router.back();
  }

  function handleSaveError(error: unknown) {
    if (
      error instanceof Error &&
      error.message === "NOTIFICATIONS_PERMISSION_DENIED"
    ) {
      Alert.alert("", t("notifications.permissionDenied"));
      return;
    }

    Alert.alert("", t("errors.saveFailed"));
  }

  return {
    save,
    handleSaveError,
  };
}
