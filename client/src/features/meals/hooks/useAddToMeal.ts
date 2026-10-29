import { useRef, useState } from "react";
import { AccessibilityInfo, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { DateKey } from "../../../shared/helpers/dateKey";
import { useAddMealItemOnDate } from "../../day-log/hooks/useDayLog";
import { useSelectedDate } from "../../day-log/hooks/useSelectedDate";
import { useSelectedDateStore } from "../../day-log/store/selectedDateStore";
import { AmountPayload } from "../../pantry/helpers/serving";
import { LOGGABLE_MEAL_TYPES, LoggableMealType, mealTypeForTime } from "../constants/mealTypes";

export type SavedMealTarget = { date: DateKey; mealType: LoggableMealType };

export function useAddToMeal(productId: string, amount: AmountPayload) {
  const { t } = useTranslation("pantry");
  const selected = useSelectedDate();
  const setSelectedDate = useSelectedDateStore((state) => state.setSelectedDate);
  const add = useAddMealItemOnDate();

  const [date, setDate] = useState<DateKey>(selected.date);
  const [mealType, setMealType] = useState<LoggableMealType>(() => mealTypeForTime(new Date()));
  const [saved, setSaved] = useState<SavedMealTarget | null>(null);
  const inFlight = useRef(false);

  const canSave = !add.isPending && !saved && date <= selected.maxDate;

  function chooseDate(next: DateKey) {
    if (next > selected.maxDate) return;
    setDate(next);
  }

  async function save() {
    if (!canSave || inFlight.current) return;
    inFlight.current = true;
    try {
      await add.mutateAsync({
        date,
        payload: { mealType, pantryProductId: productId, ...amount },
      });
      setSaved({ date, mealType });
      AccessibilityInfo.announceForAccessibility(
        t("calculatorMeal.savedAnnouncement", { meal: t(`mealTypes.${mealType}`) }),
      );
    } catch {
      Alert.alert("", t("calculatorMeal.saveFailed"));
    } finally {
      inFlight.current = false;
    }
  }

  function viewDay() {
    if (!saved) return;
    setSelectedDate(saved.date === selected.today ? null : saved.date);
    router.navigate("/(app)/dashboard");
  }

  return {
    date,
    today: selected.today,
    maxDate: selected.maxDate,
    mealType,
    mealTypes: LOGGABLE_MEAL_TYPES,
    saved,
    isSaving: add.isPending,
    canSave,
    chooseDate,
    setMealType,
    save,
    viewDay,
  };
}
