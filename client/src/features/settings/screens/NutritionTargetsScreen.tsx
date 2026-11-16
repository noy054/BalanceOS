import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { SettingsScreenLayout } from "../components/SettingsScreenLayout";
import { FormInput } from "../../../shared/components/FormInput";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { useNutritionSettings, useTargetSuggestion, useUpdateSettings } from "../hooks/useSettings";
import { TargetComparisonTable } from "../components/TargetComparisonTable";
import { differsFromCurrent } from "../helpers/targetSuggestion";
import { TargetMode } from "../types";
import { Button } from "../../../shared/components/ui/Button";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { useStyles } from "./styles/NutritionTargetsScreen.styles";
import { useDirection } from "../../../shared/hooks/useDirection";
import { keyboardBehavior } from "../../../shared/components/ui/KeyboardAvoider";

type FormValues = {
  targetMode: TargetMode;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
};

function parseTarget(value: string): number | undefined {
  const parsedValue = parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return undefined;
  }

  return parsedValue;
}

function toFormValues(
  settings: ReturnType<typeof useNutritionSettings>["data"],
): FormValues {
  const isExpertMode = settings?.experienceMode === "EXPERT";

  return {
    targetMode: isExpertMode ? "MANUAL" : (settings?.targetMode ?? "AUTO"),
    calories: settings?.dailyCaloriesTarget?.toString() ?? "",
    protein: settings?.proteinTarget?.toString() ?? "",
    carbs: settings?.carbsTarget?.toString() ?? "",
    fat: settings?.fatTarget?.toString() ?? "",
    fiber: settings?.fiberTarget?.toString() ?? "",
  };
}

export function NutritionTargetsScreen() {
  const { t } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const isExpertMode = settings?.experienceMode === "EXPERT";
  const { data: suggestion } = useTargetSuggestion(Boolean(settings) && !isExpertMode);

  const [targetMode, setTargetMode] = useState<TargetMode>("AUTO");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const initialValuesRef = useRef<FormValues | null>(null);
  const settingsInitializedRef = useRef(false);

  useEffect(() => {
    if (!settings || settingsInitializedRef.current) {
      return;
    }

    const initialValues = toFormValues(settings);

    settingsInitializedRef.current = true;
    initialValuesRef.current = initialValues;

    setTargetMode(initialValues.targetMode);
    setCalories(initialValues.calories);
    setProtein(initialValues.protein);
    setCarbs(initialValues.carbs);
    setFat(initialValues.fat);
    setFiber(initialValues.fiber);
  }, [settings]);

  const effectiveTargetMode: TargetMode = isExpertMode ? "MANUAL" : targetMode;
  const shouldShowTargetModeSelector = !isExpertMode;
  const shouldShowManualTargets = isExpertMode || targetMode === "MANUAL";

  const currentValues = useMemo<FormValues>(
    () => ({
      targetMode: effectiveTargetMode,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    }),
    [effectiveTargetMode, calories, protein, carbs, fat, fiber],
  );

  const appliesCalculated =
    effectiveTargetMode === "AUTO" && Boolean(suggestion?.suggested) && differsFromCurrent(suggestion);

  const hasChanges = useMemo(() => {
    const initialValues = initialValuesRef.current;

    if (!initialValues) {
      return false;
    }

    return (
      appliesCalculated ||
      currentValues.targetMode !== initialValues.targetMode ||
      currentValues.calories !== initialValues.calories ||
      currentValues.protein !== initialValues.protein ||
      currentValues.carbs !== initialValues.carbs ||
      currentValues.fat !== initialValues.fat ||
      currentValues.fiber !== initialValues.fiber
    );
  }, [currentValues, appliesCalculated]);

  const isSaveDisabled = isSaving || !hasChanges;

  async function handleSave() {
    if (isSaveDisabled) {
      return;
    }

    setIsSaving(true);

    try {
      const calculated = effectiveTargetMode === "AUTO" ? suggestion?.suggested : null;
      await updateSettings.mutateAsync(
        calculated
          ? {
              targetMode: "AUTO",
              dailyCaloriesTarget: calculated.calories,
              proteinTarget: calculated.protein,
              carbsTarget: calculated.carbs,
              fatTarget: calculated.fat,
              fiberTarget: calculated.fiber,
            }
          : {
              targetMode: effectiveTargetMode,
              dailyCaloriesTarget: parseTarget(calories),
              proteinTarget: parseTarget(protein),
              carbsTarget: parseTarget(carbs),
              fatTarget: parseTarget(fat),
              fiberTarget: parseTarget(fiber),
            },
      );

      initialValuesRef.current = currentValues;

      router.back();
    } catch {
      Alert.alert("", t("errors.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SettingsScreenLayout title={t("nutritionTargets.screenTitle")}>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={keyboardBehavior}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {shouldShowTargetModeSelector && (
            <SettingsSection title={t("nutritionTargets.targetModeSection")}>
              <SettingsSelectRow
                label={t("nutritionTargets.targetModeSection")}
                value={targetMode}
                options={[
                  {
                    value: "AUTO" as TargetMode,
                    label: t("nutritionTargets.targetModeAuto"),
                  },
                  {
                    value: "MANUAL" as TargetMode,
                    label: t("nutritionTargets.targetModeManual"),
                  },
                ]}
                onChange={setTargetMode}
                last
              />
            </SettingsSection>
          )}

          {!shouldShowManualTargets ? (
            <>
              <View style={styles.infoBanner}>
                <Text style={[styles.infoBannerText, dir.text]}>
                  {t("nutritionTargets.targetModeAutoHint")}
                </Text>
              </View>

              {suggestion?.available && suggestion.suggested ? (
                <SettingsSection title={t("targetSuggestion.titleCalculated")}>
                  <View style={styles.calculated}>
                    <TargetComparisonTable
                      suggestion={suggestion}
                      goalIsCutting={settings?.goalType === "CUTTING"}
                    />
                    {!differsFromCurrent(suggestion) ? (
                      <Text style={[styles.upToDate, dir.text]}>{t("targetSuggestion.upToDate")}</Text>
                    ) : null}
                  </View>
                </SettingsSection>
              ) : suggestion && !suggestion.available ? (
                <View style={styles.missingCard}>
                  <Text style={[styles.missingTitle, dir.text]}>{t("targetSuggestion.missingTitle")}</Text>
                  <Text style={[styles.missingBody, dir.text]}>
                    {t("targetSuggestion.missingBody", {
                      fields: suggestion.missing.map((field) => t(`targetSuggestion.fields.${field}`)).join(", "),
                    })}
                  </Text>
                  <Button
                    label={t("targetSuggestion.completeProfile")}
                    variant="secondary"
                    size="sm"
                    onPress={() => router.push("/(app)/settings/profile")}
                  />
                </View>
              ) : null}
            </>
          ) : (
            <SettingsSection title={t("nutritionTargets.targetsSection")}>
              <View style={styles.formCard}>
                <FormInput
                  label={t("nutritionTargets.caloriesLabel")}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="number-pad"
                />

                <View style={[styles.grid, dir.row]}>
                  <View style={styles.gridCell}>
                    <FormInput
                      label={t("nutritionTargets.proteinLabel")}
                      value={protein}
                      onChangeText={setProtein}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.gridCell}>
                    <FormInput
                      label={t("nutritionTargets.carbsLabel")}
                      value={carbs}
                      onChangeText={setCarbs}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={[styles.grid, dir.row]}>
                  <View style={styles.gridCell}>
                    <FormInput
                      label={t("nutritionTargets.fatLabel")}
                      value={fat}
                      onChangeText={setFat}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.gridCell}>
                    <FormInput
                      label={t("nutritionTargets.fiberLabel")}
                      value={fiber}
                      onChangeText={setFiber}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>
            </SettingsSection>
          )}
        </ScrollView>

        <StickyFooter>
          <Button
            label={
              isSaving
                ? t("nutritionTargets.saving")
                : appliesCalculated
                  ? t("targetSuggestion.applyCalculated")
                  : t("nutritionTargets.saveButton")
            }
            onPress={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoidingView>
    </SettingsScreenLayout>
  );
}
