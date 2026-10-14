import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useCopyMealEntry } from "../hooks/useDayLog";
import { MealEntrySummary } from "../types";
import { useAppTheme } from "../../../shared/theme";
import { colors as staticColors, spacing, radius } from "../../../shared/theme";

type DayOption = {
  date: string;
  dayIndex: number;
  dayNum: number;
};

function getNextSixDays(): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split("T")[0],
      dayIndex: d.getDay(),
      dayNum: d.getDate(),
    });
  }
  return days;
}

type Props = {
  meal: MealEntrySummary | null;
  onClose: () => void;
};

export function CopyMealModal({ meal, onClose }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const copyMeal = useCopyMealEntry();

  const days = getNextSixDays();

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
    if (!meal || selected.size === 0) return;
    copyMeal.mutate(
      { mealEntryId: meal.id, targetDates: [...selected] },
      { onSuccess: handleClose },
    );
  }

  if (!meal) return null;

  const confirmLabel = t(`copyMeal.confirm_${selected.size === 1 ? "one" : "other"}`, {
    count: selected.size,
    defaultValue: `Copy to ${selected.size} day(s)`,
  });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("copyMeal.title", { defaultValue: "Add to more days" })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("copyMeal.subtitle", { defaultValue: "Select days to copy this meal to" })}
          </Text>

          <ScrollView style={styles.dayList} showsVerticalScrollIndicator={false}>
            {days.map((day) => {
              const isSelected = selected.has(day.date);
              const dayName = t(`copyMeal.weekdays.${day.dayIndex}`, { defaultValue: String(day.dayIndex) });
              return (
                <Pressable
                  key={day.date}
                  style={[
                    styles.dayRow,
                    { borderColor: colors.border, backgroundColor: colors.cardBackgroundSoft },
                    isSelected && { borderColor: staticColors.primaryGreen, backgroundColor: staticColors.primaryGreenLight },
                  ]}
                  onPress={() => toggleDay(day.date)}
                >
                  <View style={[styles.checkbox, { borderColor: isSelected ? staticColors.primaryGreen : colors.border }]}>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={14} color={staticColors.primaryGreen} />
                    )}
                  </View>

                  <Text style={[styles.dayName, { color: colors.textPrimary }]}>{dayName}</Text>
                  <Text style={[styles.dayDate, { color: colors.textSecondary }]}>{day.date}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {t("copyMeal.cancel", { defaultValue: "Cancel" })}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmBtn,
                { backgroundColor: staticColors.primaryGreen },
                (selected.size === 0 || copyMeal.isPending) && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selected.size === 0 || copyMeal.isPending}
            >
              <Text style={styles.confirmText}>
                {copyMeal.isPending ? "..." : selected.size > 0 ? confirmLabel : t("copyMeal.title", { defaultValue: "Add to more days" })}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 36,
    maxHeight: "75%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: spacing.md,
  },
  dayList: {
    flexGrow: 0,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dayName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  dayDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  confirmBtn: {
    flex: 2,
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#081008",
  },
});
