import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import {
  useNutritionSettings,
  useUpdateProfile,
  useUpdateSettings,
} from "./useSettings";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import { Gender, GoalType } from "../types";
import {
  formatProfileDate,
  getProfileDatePickerValue,
} from "../utils/profileDate";

type FormValues = {
  fullName: string;
  heightCm: string;
  weightKg: string;
  trainingDays: string;
  birthDate: string;
  gender: Gender | "";
  goalType: GoalType | "";
};

export function useProfileSettingsForm() {
  const { t } = useTranslation("settings");

  const user = useAuthStore((state) => state.user);
  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [trainingDays, setTrainingDays] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [goalType, setGoalType] = useState<GoalType | "">("");
  const [nameError, setNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBirthDatePickerOpen, setIsBirthDatePickerOpen] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState(new Date());

  const initialValuesRef = useRef<FormValues | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!settings || initializedRef.current) {
      return;
    }

    const initialValues: FormValues = {
      fullName: user?.fullName ?? "",
      heightCm: settings.heightCm?.toString() ?? "",
      weightKg: settings.weightKg?.toString() ?? "",
      trainingDays: settings.trainingDaysPerWeek?.toString() ?? "",
      birthDate: settings.birthDate?.slice(0, 10) ?? "",
      gender: settings.gender ?? "",
      goalType: settings.goalType ?? "",
    };

    initializedRef.current = true;
    initialValuesRef.current = initialValues;

    setFullName(initialValues.fullName);
    setHeightCm(initialValues.heightCm);
    setWeightKg(initialValues.weightKg);
    setTrainingDays(initialValues.trainingDays);
    setBirthDate(initialValues.birthDate);
    setGender(initialValues.gender);
    setGoalType(initialValues.goalType);
    setTempBirthDate(getProfileDatePickerValue(initialValues.birthDate));
  }, [settings, user?.fullName]);

  const currentValues = useMemo<FormValues>(
    () => ({
      fullName,
      heightCm,
      weightKg,
      trainingDays,
      birthDate,
      gender,
      goalType,
    }),
    [fullName, heightCm, weightKg, trainingDays, birthDate, gender, goalType],
  );

  const hasChanges = useMemo(() => {
    const initialValues = initialValuesRef.current;

    if (!initialValues) {
      return false;
    }

    return Object.keys(currentValues).some((key) => {
      const field = key as keyof FormValues;
      return currentValues[field] !== initialValues[field];
    });
  }, [currentValues]);

  function openBirthDatePicker() {
    setTempBirthDate(getProfileDatePickerValue(birthDate));
    setIsBirthDatePickerOpen(true);
  }

  function closeBirthDatePicker() {
    setIsBirthDatePickerOpen(false);
  }

  function confirmBirthDatePicker() {
    setBirthDate(formatProfileDate(tempBirthDate));
    setIsBirthDatePickerOpen(false);
  }

  function handleBirthDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    if (event.type === "dismissed") {
      if (Platform.OS === "android") {
        setIsBirthDatePickerOpen(false);
      }

      return;
    }

    if (!selectedDate) {
      return;
    }

    if (Platform.OS === "android") {
      setIsBirthDatePickerOpen(false);
      setBirthDate(formatProfileDate(selectedDate));
      return;
    }

    setTempBirthDate(selectedDate);
  }

  async function handleSave() {
    if (!hasChanges || isSaving) {
      return;
    }

    if (!fullName.trim()) {
      setNameError(t("errors.fullNameRequired"));
      return;
    }

    setIsSaving(true);

    try {
      await Promise.all([
        updateProfile.mutateAsync({
          fullName: fullName.trim(),
        }),
        updateSettings.mutateAsync({
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          trainingDaysPerWeek: trainingDays
            ? parseInt(trainingDays, 10)
            : undefined,
          birthDate: birthDate || undefined,
          gender: (gender as Gender) || undefined,
          goalType: (goalType as GoalType) || undefined,
        }),
      ]);

      initialValuesRef.current = {
        ...currentValues,
        fullName: fullName.trim(),
      };

      router.back();
    } catch {
      Alert.alert("", t("errors.profileSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return {
    user,
    fullName,
    setFullName,
    heightCm,
    setHeightCm,
    weightKg,
    setWeightKg,
    trainingDays,
    setTrainingDays,
    birthDate,
    setBirthDate,
    gender,
    setGender,
    goalType,
    setGoalType,
    nameError,
    setNameError,
    isSaving,
    isSaveDisabled: isSaving || !hasChanges,
    isBirthDatePickerOpen,
    tempBirthDate,
    birthDatePickerValue: getProfileDatePickerValue(birthDate),
    openBirthDatePicker,
    closeBirthDatePicker,
    confirmBirthDatePicker,
    handleBirthDateChange,
    handleSave,
  };
}
