import { useRef, useState } from "react";
import { Alert } from "react-native";
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
  const inFlight = useRef(false);

  const canSave = !add.isPending && date <= selected.maxDate;

  function chooseDate(next: DateKey) {
    if (next > selected.maxDate) return;
    setDate(next);
  }

  async function save(): Promise<SavedMealTarget | null> {
    if (!canSave || inFlight.current) return null;
    inFlight.current = true;
    try {
      await add.mutateAsync({
        date,
        payload: { mealType, pantryProductId: productId, ...amount },
      });
      return { date, mealType };
    } catch {
      Alert.alert("", t("calculatorMeal.saveFailed"));
      return null;
    } finally {
      inFlight.current = false;
    }
  }

  function viewDay(target: SavedMealTarget) {
    setSelectedDate(target.date === selected.today ? null : target.date);
    router.navigate("/(app)/dashboard");
  }

  return {
    date,
    today: selected.today,
    maxDate: selected.maxDate,
    mealType,
    mealTypes: LOGGABLE_MEAL_TYPES,
    isSaving: add.isPending,
    canSave,
    chooseDate,
    setMealType,
    save,
    viewDay,
  };
}
