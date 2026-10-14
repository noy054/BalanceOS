import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../shared/theme";
import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";
import { useNotificationsSettingsForm } from "../hooks/useNotificationsSettingsForm";
import {
  getDirectionStyles,
  useStyles,
} from "../screens/styles/NotificationsSettingsScreen.styles";

type Props = {
  form: ReturnType<typeof useNotificationsSettingsForm>;
  isRTL: boolean;
};

export function NotificationWaterSection({ form, isRTL }: Props) {
  const { t } = useTranslation("settings");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <SettingsSection title={t("notifications.waterReminder")}>
      <SettingsToggleRow
        label={t("notifications.waterReminder")}
        value={form.water}
        onValueChange={form.setWater}
        last
      />

      {form.water ? (
        <View style={[styles.intervalRow, dir.row]}>
          <Text style={[styles.intervalLabel, dir.text]}>
            {t("notifications.waterIntervalLabel")}
          </Text>

          <TextInput
            style={styles.intervalInput}
            value={form.waterInterval}
            onChangeText={form.setWaterInterval}
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      ) : null}
    </SettingsSection>
  );
}
