import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";
import { useNotificationsSettingsForm } from "../hooks/useNotificationsSettingsForm";
import {
  getDirectionStyles,
  useStyles,
} from "../screens/styles/NotificationsSettingsScreen.styles";

type Props = {
  form: ReturnType<typeof useNotificationsSettingsForm>;
  timePlaceholder: string;
  isRTL: boolean;
};

const WEEK_DAYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

export function NotificationWeeklySummarySection({
  form,
  timePlaceholder,
  isRTL,
}: Props) {
  const { t } = useTranslation("settings");
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <SettingsSection title={t("notifications.weeklySummary")}>
      <SettingsToggleRow
        label={t("notifications.weeklySummary")}
        value={form.weekly}
        onValueChange={form.setWeekly}
      />

      {form.weekly ? (
        <View style={styles.weeklyOptions}>
          <View style={[styles.dayChips, dir.row]}>
            {WEEK_DAYS.map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayChip,
                  form.weeklyDay === day && styles.dayChipActive,
                ]}
                onPress={() => form.setWeeklyDay(day)}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    form.weeklyDay === day && styles.dayChipTextActive,
                  ]}
                >
                  {t(
                    `notifications.days.${day}` as Parameters<typeof t>[0],
                  ).slice(0, 3)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.weeklyTimeInputButton}
            onPress={() => form.openTimePicker("weekly")}
          >
            <Text
              style={[
                styles.weeklyTimeInputText,
                dir.timeText,
                !form.weeklyTime && styles.weeklyTimeInputPlaceholder,
              ]}
            >
              {form.weeklyTime || timePlaceholder}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SettingsSection>
  );
}
