import { useEffect, useRef, useState } from "react";

import { NutritionSettings } from "../types";
import { TimeField, timeToDate } from "../helpers/notificationTime";

export function useNotificationsSettingsForm(settings?: NutritionSettings) {
  const [breakfast, setBreakfast] = useState(false);
  const [breakfastTime, setBreakfastTime] = useState("");

  const [lunch, setLunch] = useState(false);
  const [lunchTime, setLunchTime] = useState("");

  const [dinner, setDinner] = useState(false);
  const [dinnerTime, setDinnerTime] = useState("");

  const [water, setWater] = useState(false);
  const [waterInterval, setWaterInterval] = useState("");

  const [daily, setDaily] = useState(false);
  const [dailyTime, setDailyTime] = useState("");

  const [weekly, setWeekly] = useState(false);
  const [weeklyDay, setWeeklyDay] = useState("0");
  const [weeklyTime, setWeeklyTime] = useState("");

  const [weighIn, setWeighIn] = useState(false);
  const [weighInDays, setWeighInDays] = useState<number[]>([]);
  const [weighInTime, setWeighInTime] = useState("");

  const [activeTimeField, setActiveTimeField] = useState<TimeField | null>(
    null,
  );
  const [pickerValue, setPickerValue] = useState(new Date());

  const settingsInitialized = useRef(false);

  useEffect(() => {
    if (!settings || settingsInitialized.current) {
      return;
    }

    settingsInitialized.current = true;

    setBreakfast(settings.breakfastReminderEnabled ?? false);
    setBreakfastTime(settings.breakfastReminderTime ?? "");

    setLunch(settings.lunchReminderEnabled ?? false);
    setLunchTime(settings.lunchReminderTime ?? "");

    setDinner(settings.dinnerReminderEnabled ?? false);
    setDinnerTime(settings.dinnerReminderTime ?? "");

    setWater(settings.waterReminderEnabled ?? false);
    setWaterInterval(settings.waterReminderInterval?.toString() ?? "");

    setDaily(settings.dailySummaryEnabled ?? false);
    setDailyTime(settings.dailySummaryTime ?? "");

    setWeekly(settings.weeklySummaryEnabled ?? false);
    setWeeklyDay(settings.weeklySummaryDay?.toString() ?? "0");
    setWeeklyTime(settings.weeklySummaryTime ?? "");

    setWeighIn(settings.weighInReminderEnabled ?? false);
    setWeighInDays(settings.weighInReminderDays ?? []);
    setWeighInTime(settings.weighInReminderTime ?? "");
  }, [settings]);

  function getTimeValue(field: TimeField) {
    switch (field) {
      case "breakfast":
        return breakfastTime;
      case "lunch":
        return lunchTime;
      case "dinner":
        return dinnerTime;
      case "daily":
        return dailyTime;
      case "weekly":
        return weeklyTime;
      case "weighIn":
        return weighInTime;
    }
  }

  function setTimeValue(field: TimeField, value: string) {
    switch (field) {
      case "breakfast":
        setBreakfastTime(value);
        break;
      case "lunch":
        setLunchTime(value);
        break;
      case "dinner":
        setDinnerTime(value);
        break;
      case "daily":
        setDailyTime(value);
        break;
      case "weekly":
        setWeeklyTime(value);
        break;
      case "weighIn":
        setWeighInTime(value);
        break;
    }
  }

  function openTimePicker(field: TimeField) {
    setPickerValue(timeToDate(getTimeValue(field)));
    setActiveTimeField(field);
  }

  function closeTimePicker() {
    setActiveTimeField(null);
  }

  function toggleWeighInDay(day: number) {
    setWeighInDays((prev) =>
      prev.includes(day) ? prev.filter((entry) => entry !== day) : [...prev, day].sort((a, b) => a - b),
    );
  }

  return {
    breakfast,
    setBreakfast,
    breakfastTime,

    lunch,
    setLunch,
    lunchTime,

    dinner,
    setDinner,
    dinnerTime,

    water,
    setWater,
    waterInterval,
    setWaterInterval,

    daily,
    setDaily,
    dailyTime,

    weekly,
    setWeekly,
    weeklyDay,
    setWeeklyDay,
    weeklyTime,

    weighIn,
    setWeighIn,
    weighInDays,
    toggleWeighInDay,
    weighInTime,

    activeTimeField,
    pickerValue,
    setPickerValue,

    getTimeValue,
    setTimeValue,
    openTimePicker,
    closeTimePicker,
  };
}
