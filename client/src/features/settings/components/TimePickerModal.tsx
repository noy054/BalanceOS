import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../shared/theme";
import {
  getTimePickerModalDirectionStyles,
  useTimePickerModalStyles,
} from "./styles/TimePickerModal.styles";

type Props = {
  visible: boolean;
  value: Date;
  onChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function TimePickerModal({
  visible,
  value,
  onChange,
  onClose,
  onConfirm,
}: Props) {
  const { t, i18n } = useTranslation("settings");
  const { colors, resolvedTheme } = useAppTheme();
  const styles = useTimePickerModalStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getTimePickerModalDirectionStyles(isRTL);

  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerCard}>
          <View style={[styles.pickerHeader, dir.row]}>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.pickerCancelText}>
                {t("common.cancel")}
              </Text>
            </Pressable>

            <Text style={styles.pickerTitle}>
              {t("notifications.pickTime")}
            </Text>

            <Pressable onPress={onConfirm} hitSlop={12}>
              <Text style={styles.pickerDoneText}>
                {t("common.done")}
              </Text>
            </Pressable>
          </View>

          <DateTimePicker
            value={value}
            mode="time"
            display="spinner"
            is24Hour
            locale={i18n.language === "he" ? "he-IL" : "en-US"}
            textColor={colors.textPrimary}
            themeVariant={resolvedTheme === "dark" ? "dark" : "light"}
            onChange={onChange}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
