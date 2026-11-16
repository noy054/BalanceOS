import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useCopyToDays } from "../hooks/useDayLog";
import { CopyTarget } from "../types";
import { MAX_FUTURE_DAYS } from "../constants";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { addDays, DateKey, fromDateKey, todayKey } from "../../../shared/helpers/dateKey";
import { showToast } from "../../../shared/helpers/toast";
import { useDayLabels } from "../hooks/useDayLabels";
import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";

type DayOption = {
  date: string;
  dayIndex: number;
};

const DAY_OPTIONS = 6;

export function copyTargetDays(today: DateKey, sourceDate: DateKey, maxDate: DateKey): DateKey[] {
  const days: DateKey[] = [];
  for (let offset = 1; days.length < DAY_OPTIONS && offset <= DAY_OPTIONS + 1; offset++) {
    const date = addDays(today, offset);
    if (date > maxDate) break;
    if (date !== sourceDate) days.push(date);
  }
  return days;
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
  const days: DayOption[] = copyTargetDays(today, sourceDate, addDays(today, MAX_FUTURE_DAYS)).map((date) => ({
    date,
    dayIndex: fromDateKey(date).getDay(),
  }));
  const labels = useDayLabels(today);

  const dayName = (day: DayOption) => labels.relative(day.date) ?? t(`copyMeal.weekdays.${day.dayIndex}`);

  function toggleDay(date: string) {
    if (copyMeal.isError) copyMeal.reset();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function handleClose() {
    if (copyMeal.isPending) return;
    setSelected(new Set());
    copyMeal.reset();
    onClose();
  }

  function handleConfirm() {
    if (!target || selected.size === 0 || copyMeal.isPending) return;
    const targetDates = [...selected].filter((date) => date > today).sort();
    if (targetDates.length === 0) return;
    const destination = days
      .filter((day) => selected.has(day.date))
      .map((day) => `${dayName(day)} ${labels.short(day.date)}`)
      .join(", ");
    copyMeal.mutate(
      { target, targetDates, today },
      {
        onSuccess: () => {
          showToast({ message: t("copyMeal.success", { days: destination }) });
          setSelected(new Set());
          copyMeal.reset();
          onClose();
        },
      },
    );
  }

  if (!target) return null;

  const buttonLabel = copyMeal.isError
    ? t("copyMeal.retry")
    : selected.size > 0
      ? t(`copyMeal.confirm_${selected.size === 1 ? "one" : "other"}`, { count: selected.size })
      : t("copyMeal.selectDays");

  return (
    <BottomSheet
      visible
      onClose={handleClose}
      title={t("copyMeal.title")}
      subtitle={target.kind === "meal" ? t("copyMeal.subtitleMeal", { name: target.name }) : t("copyMeal.subtitleItem", { name: target.name })}
      footer={
        <View style={styles.footer}>
          {copyMeal.isError ? (
            <View style={[styles.error, dir.row]} accessibilityLiveRegion="polite" accessibilityRole="alert">
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={[styles.errorText, dir.text]}>{t("copyMeal.failed")}</Text>
            </View>
          ) : null}
          <Button
            label={buttonLabel}
            icon={copyMeal.isError ? "refresh" : "content-copy"}
            onPress={handleConfirm}
            disabled={selected.size === 0}
            loading={copyMeal.isPending}
            fullWidth
          />
        </View>
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.dayList} showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          {days.map((day, index) => {
            const isSelected = selected.has(day.date);
            const name = dayName(day);
            return (
              <Pressable
                key={day.date}
                onPress={() => toggleDay(day.date)}
                disabled={copyMeal.isPending}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${name}, ${labels.full(day.date)}`}
                style={({ pressed }) => [
                  styles.dayRow,
                  dir.row,
                  index > 0 && styles.divider,
                  isSelected && styles.dayRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.dayText, dir.alignStart]}>
                  <Text style={[styles.dayName, dir.text]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.dayDate, dir.text]} numberOfLines={1}>
                    {labels.short(day.date)}
                  </Text>
                </View>
                <View style={[styles.check, isSelected && styles.checkSelected]}>
                  {isSelected ? <MaterialCommunityIcons name="check" size={15} color={colors.onAccent} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
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
      group: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        overflow: "hidden",
      },
      dayRow: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 58,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      dayRowSelected: {
        backgroundColor: colors.accentSoft,
      },
      pressed: {
        opacity: 0.75,
      },
      dayText: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },
      dayName: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      dayDate: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      check: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
      },
      checkSelected: {
        backgroundColor: colors.accentFill,
        borderColor: colors.accentFill,
      },
      footer: {
        gap: spacing.sm,
      },
      error: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        backgroundColor: colors.dangerSoft,
      },
      errorText: {
        flex: 1,
        ...typography.footnote,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
    }),
  );
