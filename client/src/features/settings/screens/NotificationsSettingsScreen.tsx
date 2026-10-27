import { useState } from "react";
import { Platform, ScrollView } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { NotificationDailySummarySection } from "../components/NotificationDailySummarySection";
import { NotificationMealRemindersSection } from "../components/NotificationMealRemindersSection";
import { NotificationWaterSection } from "../components/NotificationWaterSection";
import { NotificationWeeklySummarySection } from "../components/NotificationWeeklySummarySection";
import { TimePickerModal } from "../components/TimePickerModal";
import { useNutritionSettings } from "../hooks/useSettings";
import { useNotificationsSettingsForm } from "../hooks/useNotificationsSettingsForm";
import { useSaveNotificationsSettings } from "../hooks/useSaveNotificationsSettings";
import { formatTime } from "../helpers/notificationTime";
import { useStyles } from "./styles/NotificationsSettingsScreen.styles";

export function NotificationsSettingsScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const { data: settings } = useNutritionSettings();
  const form = useNotificationsSettingsForm(settings);
  const { save, handleSaveError } = useSaveNotificationsSettings(form, t);

  const [isSaving, setIsSaving] = useState(false);

  function handleTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        form.closeTimePicker();
        return;
      }

      if (selectedDate && form.activeTimeField) {
        form.setTimeValue(form.activeTimeField, formatTime(selectedDate));
      }

      form.closeTimePicker();
      return;
    }

    if (selectedDate) {
      form.setPickerValue(selectedDate);
    }
  }

  function confirmIosTimePicker() {
    if (form.activeTimeField) {
      form.setTimeValue(form.activeTimeField, formatTime(form.pickerValue));
    }

    form.closeTimePicker();
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      await save();
    } catch (error) {
      handleSaveError(error);
    } finally {
      setIsSaving(false);
    }
  }

  const timePlaceholder = t("notifications.timePlaceholder");

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("notifications.screenTitle")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <NotificationMealRemindersSection
          form={form}
          timePlaceholder={timePlaceholder}
          isRTL={isRTL}
        />

        <NotificationWaterSection form={form} isRTL={isRTL} />

        <NotificationDailySummarySection
          form={form}
          timePlaceholder={timePlaceholder}
          isRTL={isRTL}
        />

        <NotificationWeeklySummarySection
          form={form}
          timePlaceholder={timePlaceholder}
          isRTL={isRTL}
        />
      </ScrollView>

      <StickyFooter>
        <Button
          label={
            isSaving
              ? t("notifications.saving")
              : t("notifications.saveButton")
          }
          onPress={handleSave}
          loading={isSaving}
          fullWidth
        />
      </StickyFooter>

      {Platform.OS === "android" && form.activeTimeField ? (
        <DateTimePicker
          value={form.pickerValue}
          mode="time"
          display="clock"
          is24Hour
          onChange={handleTimeChange}
        />
      ) : null}

      <TimePickerModal
        visible={Boolean(form.activeTimeField)}
        value={form.pickerValue}
        onChange={handleTimeChange}
        onClose={form.closeTimePicker}
        onConfirm={confirmIosTimePicker}
      />
    </SafeAreaView>
  );
}
