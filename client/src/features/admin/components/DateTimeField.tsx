import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { DateKey, todayKey } from "../../../shared/helpers/dateKey";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { DayPickerSheet } from "../../day-log/components/DayPickerSheet";
import { useDayLabels } from "../../day-log/hooks/useDayLabels";

type Props = {
  label: string;
  emptyLabel: string;
  date: DateKey | null;
  time: string;
  error?: string;
  disabled?: boolean;
  onChangeDate: (date: DateKey | null) => void;
  onChangeTime: (time: string) => void;
};

export function DateTimeField({
  label,
  emptyLabel,
  date,
  time,
  error,
  disabled = false,
  onChangeDate,
  onChangeTime,
}: Props) {
  const { t } = useTranslation("settings");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const today = todayKey();
  const labels = useDayLabels(today);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, dir.text]}>{label}</Text>
      <View style={[styles.row, dir.row]}>
        <Pressable
          onPress={() => setOpen(true)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${date ? labels.full(date) : emptyLabel}`}
          style={({ pressed }) => [styles.dateButton, dir.row, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.dateText, !date && styles.placeholder, dir.text]} numberOfLines={1}>
            {date ? labels.full(date) : emptyLabel}
          </Text>
        </Pressable>
        {date ? (
          <>
            <TextInput
              value={time}
              onChangeText={onChangeTime}
              editable={!disabled}
              style={[styles.timeInput, error && styles.inputError]}
              placeholder="09:00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              accessibilityLabel={t("admin.announcements.timeA11y", { label })}
            />
            <IconButton
              icon="close"
              size={36}
              iconSize={18}
              disabled={disabled}
              accessibilityLabel={t("admin.announcements.clearDate", { label })}
              onPress={() => onChangeDate(null)}
            />
          </>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, dir.text]}>{error}</Text> : null}

      <DayPickerSheet
        visible={open}
        date={date ?? today}
        today={today}
        title={label}
        showMarkers={false}
        minDate={today}
        onSelect={onChangeDate}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      wrapper: { gap: spacing.xs },
      label: { ...typography.label, color: colors.textSecondary },
      row: { alignItems: "center", gap: spacing.sm },
      dateButton: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 48,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        backgroundColor: colors.inputBackground,
      },
      pressed: { opacity: 0.75 },
      dateText: { flex: 1, ...typography.body, color: colors.textPrimary },
      placeholder: { color: colors.textMuted },
      timeInput: {
        width: 76,
        minHeight: 48,
        borderRadius: radius.md,
        backgroundColor: colors.inputBackground,
        textAlign: "center",
        ...typography.body,
        ...typography.number,
        color: colors.textPrimary,
      },
      inputError: { borderWidth: 1, borderColor: colors.danger },
      error: { ...typography.caption, color: colors.danger },
    }),
  );
