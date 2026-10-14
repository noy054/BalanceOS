import { Pressable, Text, View } from "react-native";

import { SettingsToggleRow } from "./SettingsToggleRow";
import {
  getReminderTimeRowDirectionStyles,
  useReminderTimeRowStyles,
} from "./styles/ReminderTimeRow.styles";

type Props = {
  label: string;
  enabled: boolean;
  time: string;
  onToggle: (value: boolean) => void;
  onTimePress: () => void;
  timePlaceholder: string;
  isRTL: boolean;
  last?: boolean;
};

export function ReminderTimeRow({
  label,
  enabled,
  time,
  onToggle,
  onTimePress,
  timePlaceholder,
  isRTL,
  last = false,
}: Props) {
  const styles = useReminderTimeRowStyles();
  const dir = getReminderTimeRowDirectionStyles(isRTL);

  return (
    <View style={[styles.reminderRow, !last && styles.reminderRowBorder]}>
      <SettingsToggleRow
        label={label}
        value={enabled}
        onValueChange={onToggle}
        last
      />

      {enabled ? (
        <Pressable style={styles.timeInputButton} onPress={onTimePress}>
          <Text
            style={[
              styles.timeInputText,
              dir.timeText,
              !time && styles.timeInputPlaceholder,
            ]}
          >
            {time || timePlaceholder}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
