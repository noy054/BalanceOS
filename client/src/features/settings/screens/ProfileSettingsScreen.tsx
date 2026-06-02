import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormInput } from "../../../shared/components/FormInput";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import {
  useNutritionSettings,
  useUpdateProfile,
  useUpdateSettings,
} from "../hooks/useSettings";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import { Gender, GoalType } from "../types";
import {
  getDirectionStyles,
  styles,
} from "./styles/ProfileSettingsScreen.styles";

type FormValues = {
  fullName: string;
  heightCm: string;
  weightKg: string;
  trainingDays: string;
  birthDate: string;
  gender: Gender | "";
  goalType: GoalType | "";
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDatePickerValue(value: string) {
  if (!value) {
    return new Date();
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

export function ProfileSettingsScreen() {
  const { t, i18n } = useTranslation("settings");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

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

  function handleBirthDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    if (Platform.OS === "android") {
      setIsBirthDatePickerOpen(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setBirthDate(formatDate(selectedDate));
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

  const isSaveDisabled = isSaving || !hasChanges;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.glowTop} />
        <View style={styles.glowSide} />
      </View>

      <ScreenHeader title={t("profile.screenTitle")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title={t("sections.profile")}>
          <View style={styles.formCard}>
            <FormInput
              label={t("profile.fullNameLabel")}
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                setNameError("");
              }}
              error={nameError}
            />

            <View style={styles.readonlyGroup}>
              <Text style={[styles.readonlyLabel, dir.text]}>
                {t("profile.emailLabel")}
              </Text>

              <Text style={[styles.emailValue, dir.text]}>
                {user?.email ?? ""}
              </Text>

              <Text style={[styles.emailNote, dir.text]}>
                {t("profile.emailNote")}
              </Text>
            </View>
          </View>
        </SettingsSection>

        <SettingsSection title={t("sections.preferences")}>
          <View style={styles.selectCard}>
            <SettingsSelectRow
              label={t("profile.genderLabel")}
              value={gender as Gender}
              options={[
                {
                  value: "MALE" as Gender,
                  label: t("profile.genderMale"),
                },
                {
                  value: "FEMALE" as Gender,
                  label: t("profile.genderFemale"),
                },
                {
                  value: "OTHER" as Gender,
                  label: t("profile.genderOther"),
                },
              ]}
              onChange={setGender}
            />

            <SettingsSelectRow
              label={t("profile.goalLabel")}
              value={goalType as GoalType}
              options={[
                {
                  value: "CUTTING" as GoalType,
                  label: t("profile.goalCutting"),
                },
                {
                  value: "MAINTENANCE" as GoalType,
                  label: t("profile.goalMaintenance"),
                },
                {
                  value: "BULKING" as GoalType,
                  label: t("profile.goalBulking"),
                },
              ]}
              onChange={setGoalType}
              last
            />
          </View>
        </SettingsSection>

        <SettingsSection title={t("profile.bodyDetailsTitle")}>
          <View style={styles.formCard}>
            <Pressable
              onPress={() => setIsBirthDatePickerOpen(true)}
              style={({ pressed }) => pressed && styles.dateInputPressed}
            >
              <View pointerEvents="none">
                <FormInput
                  label={t("profile.birthDateLabel")}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder={t("profile.birthDatePlaceholder")}
                  editable={false}
                />
              </View>
            </Pressable>

            {isBirthDatePickerOpen && (
              <DateTimePicker
                value={getDatePickerValue(birthDate)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={handleBirthDateChange}
              />
            )}

            <FormInput
              label={t("profile.heightLabel")}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
            />

            <FormInput
              label={t("profile.weightLabel")}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
            />

            <FormInput
              label={t("profile.trainingDaysLabel")}
              value={trainingDays}
              onChangeText={setTrainingDays}
              keyboardType="number-pad"
            />
          </View>
        </SettingsSection>

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && !isSaveDisabled && styles.saveBtnPressed,
            isSaveDisabled && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? t("profile.saving") : t("profile.saveButton")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
