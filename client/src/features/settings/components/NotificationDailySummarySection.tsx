import { useTranslation } from "react-i18next";

import { SettingsSection } from "./SettingsSection";
import { ReminderTimeRow } from "./ReminderTimeRow";
import { useNotificationsSettingsForm } from "../hooks/useNotificationsSettingsForm";

type Props = {
  form: ReturnType<typeof useNotificationsSettingsForm>;
  timePlaceholder: string;
  isRTL: boolean;
};

export function NotificationDailySummarySection({
  form,
  timePlaceholder,
  isRTL,
}: Props) {
  const { t } = useTranslation("settings");

  return (
    <SettingsSection title={t("notifications.dailySummary")}>
      <ReminderTimeRow
        label={t("notifications.dailySummary")}
        enabled={form.daily}
        time={form.dailyTime}
        onToggle={form.setDaily}
        onTimePress={() => form.openTimePicker("daily")}
        timePlaceholder={timePlaceholder}
        isRTL={isRTL}
        last
      />
    </SettingsSection>
  );
}
