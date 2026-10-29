import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useCopyToDays } from "../hooks/useDayLog";
import { CopyTarget } from "../types";
import { MAX_FUTURE_DAYS } from "../constants";
import {
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { addDays, DateKey, fromDateKey, todayKey } from "../../../shared/helpers/dateKey";
import { useDayLabels } from "../hooks/useDayLabels";
import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";

type DayOption = {
  date: string;
  dayIndex: number;
  dayNum: number;
};

function getNextSixDays(sourceDate: DateKey, maxDate: DateKey): DayOption[] {
  return Array.from({ length: 6 }, (_, index) => addDays(sourceDate, index + 1))
    .filter((date) => date <= maxDate)
    .map((date) => {
      const day = fromDateKey(date);
      return { date, dayIndex: day.getDay(), dayNum: day.getDate() };
    });
}

type Props = {
  target: CopyTarget | null;
  sourceDate: DateKey;
  onClose: () => void;
};

export function CopyMealModal({ target, sourceDate, onClose }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const copyMeal = useCopyToDays();

  const today = todayKey();
  const days = getNextSixDays(sourceDate, addDays(today, MAX_FUTURE_DAYS));
  const labels = useDayLabels(today);

  function toggleDay(date: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function handleClose() {
    setSelected(new Set());
    copyMeal.reset();
    onClose();
  }

  function handleConfirm() {
    if (!target || selected.size === 0) return;
    copyMeal.mutate(
      { target, targetDates: [...selected] },
      { onSuccess: handleClose },
    );
  }

  if (!target) return null;

  const confirmLabel = t(`copyMeal.confirm_${selected.size === 1 ? "one" : "other"}`, {
    count: selected.size,
  });

  return (
    <BottomSheet
      visible
      onClose={handleClose}
      title={t("copyMeal.title")}
      subtitle={
        target.kind === "meal"
          ? t("copyMeal.subtitle")
          : t("copyMeal.subtitleItem", { name: target.name })
      }
      footer={
        <View style={[styles.actions, dir.row]}>
          <Button
            label={t("copyMeal.cancel")}
            variant="secondary"
            onPress={handleClose}
            style={styles.cancelButton}
          />
          <Button
            label={selected.size > 0 ? confirmLabel : t("copyMeal.title")}
            onPress={handleConfirm}
            disabled={selected.size === 0}
            loading={copyMeal.isPending}
            style={styles.confirmButton}
          />
        </View>
      }
    >
      <ScrollView style={styles.dayList} showsVerticalScrollIndicator={false}>
        {days.map((day) => {
          const isSelected = selected.has(day.date);
          const dayName = labels.relative(day.date) ?? t(`copyMeal.weekdays.${day.dayIndex}`);
          const dateLabel = labels.short(day.date);

          return (
            <Pressable
              key={day.date}
              onPress={() => toggleDay(day.date)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${dayName}, ${labels.full(day.date)}`}
              style={({ pressed }) => [
                styles.dayRow,
                dir.row,
                isSelected && styles.dayRowSelected,
                pressed && styles.dayRowPressed,
              ]}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected ? (
                  <MaterialCommunityIcons name="check" size={14} color={colors.onAccent} />
                ) : null}
              </View>

              <Text style={[styles.dayName, dir.text]}>{dayName}</Text>
              <Text style={styles.dayDate}>{dateLabel}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      dayList: {
        flexGrow: 0,
      },
      dayRow: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 52,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
      },
      dayRowSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
      },
      dayRowPressed: {
        opacity: 0.75,
      },
      checkbox: {
        width: 22,
        height: 22,
        borderRadius: radius.xs,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
      },
      checkboxSelected: {
        backgroundColor: colors.accentFill,
        borderColor: colors.accent,
      },
      dayName: {
        flex: 1,
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      dayDate: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      actions: {
        gap: spacing.sm,
      },
      cancelButton: {
        flex: 1,
      },
      confirmButton: {
        flex: 2,
      },
    }),
  );
