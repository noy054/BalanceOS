import { useTranslation } from "react-i18next";

import { SettingsSection } from "./SettingsSection";
import { ReminderTimeRow } from "./ReminderTimeRow";
import { useNotificationsSettingsForm } from "../hooks/useNotificationsSettingsForm";

type Props = {
  form: ReturnType<typeof useNotificationsSettingsForm>;
  timePlaceholder: string;
  isRTL: boolean;
};

export function NotificationMealRemindersSection({
  form,
  timePlaceholder,
  isRTL,
}: Props) {
  const { t } = useTranslation("settings");

  return (
    <SettingsSection title={t("sections.notifications")}>
      <ReminderTimeRow
        label={t("notifications.breakfastReminder")}
        enabled={form.breakfast}
        time={form.breakfastTime}
        onToggle={form.setBreakfast}
        onTimePress={() => form.openTimePicker("breakfast")}
        timePlaceholder={timePlaceholder}
        isRTL={isRTL}
      />

      <ReminderTimeRow
        label={t("notifications.lunchReminder")}
        enabled={form.lunch}
        time={form.lunchTime}
        onToggle={form.setLunch}
        onTimePress={() => form.openTimePicker("lunch")}
        timePlaceholder={timePlaceholder}
        isRTL={isRTL}
      />

      <ReminderTimeRow
        label={t("notifications.dinnerReminder")}
        enabled={form.dinner}
        time={form.dinnerTime}
        onToggle={form.setDinner}
        onTimePress={() => form.openTimePicker("dinner")}
        timePlaceholder={timePlaceholder}
        isRTL={isRTL}
        last
      />
    </SettingsSection>
  );
}
