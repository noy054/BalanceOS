import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";

import {
  getBirthDatePickerDirectionStyles,
  useBirthDatePickerModalStyles,
} from "./styles/BirthDatePickerModal.styles";

type Props = {
  visible: boolean;
  value: Date;
  onChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function BirthDatePickerModal({
  visible,
  value,
  onChange,
  onClose,
  onConfirm,
}: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useBirthDatePickerModalStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getBirthDatePickerDirectionStyles(isRTL);

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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={[styles.header, dir.row]}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.action}>
              <Text style={styles.cancelText}>
                {t("common.cancel", { defaultValue: "ביטול" })}
              </Text>
            </Pressable>

            <Text style={styles.title}>{t("profile.birthDateLabel")}</Text>

            <Pressable onPress={onConfirm} hitSlop={12} style={styles.action}>
              <Text style={styles.doneText}>
                {t("common.done", { defaultValue: "אישור" })}
              </Text>
            </Pressable>
          </View>

          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={onChange}
            locale={i18n.language === "he" ? "he-IL" : "en-US"}
            textColor="#F8FAFC"
            themeVariant="dark"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
