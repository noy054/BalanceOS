import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";
import { useNotificationsSettingsForm } from "../hooks/useNotificationsSettingsForm";
import { getDirectionStyles, useStyles } from "../screens/styles/NotificationsSettingsScreen.styles";

type Props = {
  form: ReturnType<typeof useNotificationsSettingsForm>;
  timePlaceholder: string;
  isRTL: boolean;
};

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
const REFERENCE_SUNDAY = new Date(2026, 10, 1);

export function NotificationWeighInSection({ form, timePlaceholder, isRTL }: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  const dayNames = useMemo(() => {
    const short = new Intl.DateTimeFormat(i18n.language, { weekday: "short" });
    const long = new Intl.DateTimeFormat(i18n.language, { weekday: "long" });
    return WEEK_DAYS.map((day) => {
      const date = new Date(REFERENCE_SUNDAY);
      date.setDate(REFERENCE_SUNDAY.getDate() + day);
      return { short: short.format(date), long: long.format(date) };
    });
  }, [i18n.language]);

  return (
    <SettingsSection title={t("notifications.weighInReminder")}>
      <SettingsToggleRow label={t("notifications.weighInReminder")} value={form.weighIn} onValueChange={form.setWeighIn} />

      {form.weighIn ? (
        <View style={styles.weeklyOptions}>
          <Text style={[styles.hint, dir.text]}>{t("notifications.weighInHint")}</Text>
          <View style={[styles.dayChips, dir.row]}>
            {WEEK_DAYS.map((day) => {
              const selected = form.weighInDays.includes(day);
              return (
                <Pressable
                  key={day}
                  style={[styles.dayChip, selected && styles.dayChipActive]}
                  onPress={() => form.toggleWeighInDay(day)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={dayNames[day].long}
                >
                  <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]} numberOfLines={1}>
                    {dayNames[day].short}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.weeklyTimeInputButton}
            onPress={() => form.openTimePicker("weighIn")}
            accessibilityRole="button"
            accessibilityLabel={`${t("notifications.weighInReminder")}: ${form.weighInTime || timePlaceholder}`}
          >
            <Text style={[styles.weeklyTimeInputText, dir.timeText, !form.weighInTime && styles.weeklyTimeInputPlaceholder]}>
              {form.weighInTime || timePlaceholder}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SettingsSection>
  );
}
