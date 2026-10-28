import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormInput } from "../../../shared/components/FormInput";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { useNutritionSettings, useUpdateSettings } from "../hooks/useSettings";
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

  const hasChanges = useMemo(() => {
    const initialValues = initialValuesRef.current;

    if (!initialValues) {
      return false;
    }

    return (
      currentValues.targetMode !== initialValues.targetMode ||
      currentValues.calories !== initialValues.calories ||
      currentValues.protein !== initialValues.protein ||
      currentValues.carbs !== initialValues.carbs ||
      currentValues.fat !== initialValues.fat ||
      currentValues.fiber !== initialValues.fiber
    );
  }, [currentValues]);

  const isSaveDisabled = isSaving || !hasChanges;

  async function handleSave() {
    if (isSaveDisabled) {
      return;
    }

    setIsSaving(true);

    try {
      await updateSettings.mutateAsync({
        targetMode: effectiveTargetMode,
        dailyCaloriesTarget: parseTarget(calories),
        proteinTarget: parseTarget(protein),
        carbsTarget: parseTarget(carbs),
        fatTarget: parseTarget(fat),
        fiberTarget: parseTarget(fiber),
      });

      initialValuesRef.current = currentValues;

      router.back();
    } catch {
      Alert.alert("", t("errors.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("nutritionTargets.screenTitle")} />

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
            <View style={styles.infoBanner}>
              <Text style={[styles.infoBannerText, dir.text]}>
                {t("nutritionTargets.targetModeAutoHint")}
              </Text>
            </View>
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
                : t("nutritionTargets.saveButton")
            }
            onPress={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
